import { Converter } from '@neoxr/zapo'
import { readFileSync as read, unlinkSync as remove, writeFileSync as create } from 'fs'
import { execFile } from 'child_process'

export const run = {
   usage: ['tomp3', 'tovn'],
   hidden: ['toaudio'],
   use: 'reply media',
   category: 'converter',
   async: async (m, {
      client,
      command,
      Utils,
      limitter
   }) => {
      try {

         const q = m.quoted ? m.quoted : m
         const mime = (client.message.get(q).mimetype || '')
         if (/audio|video/.test(mime)) {
            client.sendReact(m.chat, '🕒', m.key)
            if (/tomp3|toaudio/.test(command)) {
               const buff = await Converter.toAudio(await q.download())
               limitter()
               limitter()
            return client.sendFile(m.chat, buff, 'audio.mp3', '', m)
            } else if (/tovn/.test(command)) {
               const buff = await Converter.toPTT(await q.download())
               limitter()
               limitter()
            return client.sendFile(m.chat, buff, '', '', m, {
                  ptt: true
               })
            } else {
               client.reply(m.chat, Utils.texted('bold', `❌ This feature only for audio / video.`), m)
            }
         }
         limitter()
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   limit: true
}
