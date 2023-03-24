const { Converter } = new(require('@neoxr/neoxr-js'))
const { readFileSync: read, unlinkSync: remove, writeFileSync: create } = require('fs')
const path = require('path')
const { exec } = require('child_process')
const { tmpdir } = require('os')
exports.run = {
   usage: ['tomp3', 'tovn'],
   hidden: ['toaudio'],
   use: 'reply media',
   category: 'converter',
   async: async (m, {
      client,
      command
   }) => {
      try {
         if (m.quoted && typeof m.quoted.buttons != 'undefined' && typeof m.quoted.videoMessage != 'undefined') {
            client.sendReact(m.chat, '🕒', m.key)
            const media = await client.saveMediaMessage(m.quoted.videoMessage)
            const result = Func.filename('mp3')
            exec(`ffmpeg -i ${media} ${result}`, async (err, stderr, stdout) => {
               remove(media)
               if (err) return client.reply(m.chat, Func.texted('bold', `🚩 Conversion failed.`), m)
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
            let q = m.quoted ? m.quoted : m
            let mime = ((m.quoted ? m.quoted : m.msg).mimetype || '')
            if (/ogg/.test(mime)) {
               client.sendReact(m.chat, '🕒', m.key)
               let buffer = await m.download()
               const media = path.join(tmpdir(), Func.filename('mp3'))
               let save = create(media, buffer)
               const result = Func.filename('mp3')
               exec(`ffmpeg -i ${media} ${result}`, async (err, stderr, stdout) => {
                  remove(media)
                  if (err) return client.reply(m.chat, Func.texted('bold', `🚩 Conversion failed.`), m)
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
            } else if (/audio|video/.test(mime)) {   	
               client.sendReact(m.chat, '🕒', m.key)
               const buff = await Converter.toAudio(await q.download(), 'mp3')
               if (/tomp3|toaudio/.test(command)) return client.sendFile(m.chat, buff, 'audio.mp3', '', m)
               if (/tovn/.test(command)) return client.sendFile(m.chat, buff, 'audio.mp3', '', m, {
                  ptt: true
               })
            } else {
               client.reply(m.chat, Func.texted('bold', `🚩 This feature only for audio / video.`), m)
            }
         }
      } catch (e) {
         return client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true,
   cache: true,
   location: __filename
}