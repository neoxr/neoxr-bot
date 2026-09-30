import { Converter } from '@neoxr/wb'
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
         if (m.quoted && typeof m.quoted.buttons != 'undefined' && typeof m.quoted.videoMessage != 'undefined') {
            client.sendReact(m.chat, '🕒', m.key)
            const media = await client.saveMediaMessage(m.quoted.videoMessage)
            const result = Utils.filename('mp3')
            execFile('ffmpeg', ['-i', media, result], async (err, stderr, stdout) => {
               remove(media)
               if (err) return client.reply(m.chat, Utils.texted('bold', `❌ Conversion failed.`), m)
               let buff = read(result)
               if (/tomp3|toaudio/.test(command)) return client.sendFile(m.chat, buff, 'audio.mp3', '', m).then(() => {
                  remove(result)
               })
               if (/tovn/.test(command)) return client.sendFile(m.chat, buff, 'audio.mp3', '', m, {
                  ptt: true
               }).then(() => {
                  remove(result)
               })
            })
         } else {
            const q = m.quoted ? m.quoted : m
            const mime = ((m.quoted ? m.quoted : m.msg).mimetype || '')
            if (/audio|video/.test(mime)) {
               client.sendReact(m.chat, '🕒', m.key)
               if (/tomp3|toaudio/.test(command)) {
                  const buff = await Converter.toAudio(await q.download())
                  return client.sendFile(m.chat, buff, 'audio.mp3', '', m)
               } else if (/tovn/.test(command)) {
                  const buff = await Converter.toPTT(await q.download())
                  return client.sendFile(m.chat, buff, '', '', m, {
                     ptt: true
                  })
               }
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