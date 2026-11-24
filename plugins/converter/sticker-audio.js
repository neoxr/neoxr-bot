import { Converter } from '@neoxr/zapo'
import { proto } from 'zapo-js'

const queue = new Map()
const TTL = 5 * 60 * 1000
const MAX_SECONDS = 10

const varint = (n) => { const o = []; while (n > 127) { o.push((n & 127) | 128); n >>>= 7 } o.push(n); return o }
const field = (num, bytes) => Uint8Array.from([...varint((num << 3) | 2), ...varint(bytes.length), ...bytes])

const getEntry = (sender) => {
   const data = queue.get(sender)
   if (!data) return null
   if (Date.now() - data.time > TTL) {
      queue.delete(sender)
      return null
   }
   return data
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
         const mime = (client.message.get(q) ?? '')?.mimetype ?? ''
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

            const ptt = await Converter.toPTT(data.audio)
            const aud = await client.waUpload(ptt, { type: 'audio' })

            const options = {
               packname: exif.sk_pack,
               author: exif.sk_author
            }

            const isImage = /image/.test(mime)
            const webp = (options.packname || options.author)
               ? (isImage
                  ? await Converter.writeExifImg(media, options)
                  : await Converter.writeExifVid(media, options))
               : (isImage
                  ? await Converter.imageToWebp(media)
                  : await Converter.videoToWebp(media))
            
            const stk = await client.waUpload(webp, { type: 'image' })

            const audioBytes = proto.Message.AudioMessage.encode({
               ...aud,
               mimetype: 'audio/ogg; codecs=opus',
               ptt: true
            }).finish()

            await client.message.send(m.chat, {
               stickerMessage: { ...stk, $unknowns: [field(26, audioBytes)] }
            }, {
               quote: m,
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
   limit: false
}