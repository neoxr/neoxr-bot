import fs from 'node:fs'
import { randomBytes } from 'node:crypto'
import { Converter } from '@neoxr/wb'
import { proto, prepareWAMessageMedia } from 'baileys'

const queue = new Map()
const TTL = 5 * 60 * 1000
const MAX_SECONDS = 10

const RAW = Symbol('rawFields')
if (!proto.Message.__rawPatched) {
   const originalEncode = proto.Message.encode
   proto.Message.encode = function (message, writer) {
      const w = originalEncode.call(this, message, writer)
      if (message?.[RAW]) for (const [f, body] of message[RAW]) w.uint32(f * 8 + 2).bytes(body)
      return w
   }
   proto.Message.__rawPatched = true
}

const varint = (n) => { const o = []; while (n > 127) { o.push((n % 128) | 128); n = Math.floor(n / 128) } o.push(n); return Buffer.from(o) }
const ld = (f, body) => Buffer.concat([varint(f * 8 + 2), varint(body.length), body])

const mediaDomainInfo = (key) => ld(74, Buffer.concat([Buffer.from([0x08, 0x01]), ld(2, Buffer.from(key))]))

const parseWebp = (b) => {
   if (b.length < 30 || b.toString('ascii', 0, 4) !== 'RIFF' || b.toString('ascii', 8, 12) !== 'WEBP') throw new Error('sticker must be WebP')
   const c = b.toString('ascii', 12, 16)
   if (c === 'VP8 ') return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff, isAnimated: false }
   if (c === 'VP8L') return { width: 1 + (b[21] | ((b[22] & 0x3f) << 8)), height: 1 + ((b[22] >> 6) | (b[23] << 2) | ((b[24] & 0x0f) << 10)), isAnimated: false }
   if (c === 'VP8X') return { width: 1 + b.readUIntLE(24, 3), height: 1 + b.readUIntLE(27, 3), isAnimated: (b[20] & 2) !== 0 }
   throw new Error('unsupported WebP chunk ' + c)
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
      limitter,
      Utils
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

            queue.set(m.sender, { audio, seconds, time: Date.now() })
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
               { audio: ptt, mimetype: 'audio/ogg; codecs=opus' },
               { upload: client.waUploadToServer }
            )

            const audioBytes = Buffer.concat([
               Buffer.from(proto.Message.AudioMessage.encode(proto.Message.AudioMessage.create({
                  ...audioMessage,
                  mimetype: 'audio/ogg; codecs=opus',
                  seconds: audioMessage.seconds ?? (data.seconds != null ? Math.round(data.seconds) : undefined)
               })).finish()),
               ld(17, mediaDomainInfo(audioMessage.mediaKey)) // AudioMessage.contextInfo
            ])

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

            const info = parseWebp(webp)
            const { stickerMessage } = await prepareWAMessageMedia(
               { sticker: webp },
               { upload: client.waUploadToServer }
            )

            const contextInfo = Buffer.concat([
               Buffer.from(proto.ContextInfo.encode(proto.ContextInfo.create({
                  stanzaId: m.key.id,
                  participant: m.key.participant || m.sender,
                  quotedMessage: m.message
               })).finish()),
               mediaDomainInfo(stickerMessage.mediaKey),
               ld(82, varint(13001))
            ])

            const stickerBase = Buffer.concat([
               Buffer.from(proto.Message.StickerMessage.encode(proto.Message.StickerMessage.create({
                  ...stickerMessage,
                  mimetype: 'image/webp',
                  height: info.height,
                  width: info.width,
                  isAnimated: info.isAnimated,
                  stickerSentTs: Date.now()
               })).finish()),
               ld(17, contextInfo)
            ])

            const futureProofBody = ld(1, ld(26, Buffer.concat([stickerBase, ld(26, audioBytes)])))

            const payload = proto.Message.create({ messageContextInfo: { messageSecret: randomBytes(32) } })
            payload[RAW] = [[134, futureProofBody]]

            await client.relayMessage(m.chat, payload, {})

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