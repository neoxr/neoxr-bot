import fs from 'node:fs'
import { Converter } from '@neoxr/wb'
import { proto, prepareWAMessageMedia, generateMessageIDV2 } from 'baileys'

const queue = new Map()
const TTL = 5 * 60 * 1000
const MAX_SECONDS = 10

if (!proto.Message.StickerMessage.__patched) {
   const originalEncode = proto.Message.StickerMessage.encode
   proto.Message.StickerMessage.encode = function (message, writer) {
      const w = originalEncode.call(this, message, writer)
      if (message?.__extra) w.uint32(210).bytes(message.__extra)
      return w
   }
   proto.Message.StickerMessage.__patched = true
}

const getEntry = (sender) => {
   const data = queue.get(sender)
   if (!data) return null
   if (Date.now() - data.time > TTL) {
      queue.delete(sender)
      return null
   }
   return data
}

const toBuffer = async (input) => {
   if (Buffer.isBuffer(input)) return input
   if (typeof input === 'string') {
      const buf = await fs.promises.readFile(input)
      fs.promises.unlink(input).catch(() => {})
      return buf
   }
   return Buffer.from(input)
}

export const run = {
   usage: ['stcaudio'],
   hidden: ['saudio', 'sa'],
   category: 'converter',
   async: async (m, {
      client,
      isPrefix,
      command,
      setting: exif,
      Utils,
      limitter
   }) => {
      try {
         const q = m?.quoted ?? m
         const mime = (q.msg || q).mimetype ?? ''
         const seconds = (q.msg || q).seconds

         if (/audio/.test(mime)) {
            if (seconds > MAX_SECONDS) {
               return client.reply(m.chat, Utils.texted('bold', `❌ Maximum audio duration is ${MAX_SECONDS} seconds.`), m)
            }

            const audio = await q.download()
            if (!audio) return client.reply(m.chat, global.status.wrong, m)

            queue.set(m.sender, { audio, time: Date.now() })
            return client.reply(m.chat, Utils.texted('bold', `✅ Audio saved. Now send a photo/video (max ${MAX_SECONDS} seconds) with the caption .stcaudio, or reply to one with .stcaudio (valid for 5 minutes).`), m)
         }

         if (/image\/(jpe?g|png)|video/.test(mime)) {
            const data = getEntry(m.sender)
            if (!data) return client.reply(m.chat, Utils.texted('bold', '❌ Send an audio first with the caption .stcaudio'), m)

            if (/video/.test(mime) && seconds > MAX_SECONDS) {
               return client.reply(m.chat, Utils.texted('bold', `❌ Maximum video duration is ${MAX_SECONDS} seconds.`), m)
            }

            queue.delete(m.sender)
            await client.sendReact(m.chat, '🕒', m.key)

            const media = await q.download()
            if (!media) return client.reply(m.chat, global.status.wrong, m)

            const ptt = await toBuffer(await Converter.toPTT(data.audio))
            const { audioMessage } = await prepareWAMessageMedia(
               { audio: ptt, mimetype: 'audio/ogg; codecs=opus', ptt: true },
               { upload: client.waUploadToServer }
            )
            const audioBytes = proto.Message.AudioMessage.encode({
               ...audioMessage,
               mimetype: 'audio/ogg; codecs=opus',
               ptt: true
            }).finish()

            const options = {
               packname: exif.sk_pack,
               author: exif.sk_author
            }

            const isImage = /image/.test(mime)
            const webp = await toBuffer(
               (options.packname || options.author)
                  ? (isImage
                     ? await Converter.writeExifImg(media, options)
                     : await Converter.writeExifVid(media, options))
                  : (isImage
                     ? await Converter.imageToWebp(media)
                     : await Converter.videoToWebp(media))
            )

            const { stickerMessage } = await prepareWAMessageMedia(
               { sticker: webp },
               { upload: client.waUploadToServer }
            )

            const message = {
               stickerMessage: {
                  ...stickerMessage,
                  mimetype: 'image/webp',
                  contextInfo: {
                     stanzaId: m.key.id,
                     participant: m.sender,
                     quotedMessage: m.message
                  },
                  __extra: audioBytes
               }
            }

            await client.relayMessage(m.chat, message, {
               messageId: generateMessageIDV2(client.user?.id),
               additionalAttributes: { type: 'media' }
            })

            return limitter()
         }

         client.reply(m.chat, Utils.texted('bold', `❌ Send or reply to an audio (max ${MAX_SECONDS} seconds) with the caption ${isPrefix + command} to get started.`), m)
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   limit: true
}