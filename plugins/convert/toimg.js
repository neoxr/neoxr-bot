import { readFileSync as read, unlinkSync as remove } from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { tmpdir } from 'node:os'

export const run = {
   usage: ['toimg'],
   use: 'reply sticker',
   category: 'converter',
   async: async (m, {
      client,
      Utils
   }) => {
      try {
         if (!m.quoted) return client.reply(m.chat, Utils.texted('bold', `🚩 Reply to sticker you want to convert to an image/photo (not supported for sticker animation).`), m)
         if (m.quoted.mimetype != 'image/webp') return client.reply(m.chat, Utils.texted('bold', `🚩 Reply to sticker you want to convert to an image/photo (not supported for sticker animation).`), m)
         let media = await client.saveMediaMessage(m.quoted)
         let file = Utils.filename('png')
         let isFile = path.join(tmpdir(), file)
         exec(`ffmpeg -i ${media} ${isFile}`, (err, stderr, stdout) => {
            remove(media)
            if (err) return client.reply(m.chat, Utils.texted('bold', `🚩 Conversion failed.`), m)
            const buffer = read(isFile)
            client.sendFile(m.chat, buffer, '', '', m)
            remove(isFile)
         })
      } catch (e) {
         console.log(e)
         return client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true
}