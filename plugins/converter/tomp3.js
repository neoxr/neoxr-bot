const { readFileSync: read, unlinkSync: remove } = require('fs')
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
            client.reply(m.chat, global.status.wait, m)
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
            let mime = ((m.quoted ? m.quoted : m.msg).mimetype || '')
            if (/ogg/.test(mime)) {
               client.reply(m.chat, global.status.wait, m)
               let buffer = await m.quoted.download()
               const media = path.join(tmpdir(), Func.filename('mp3'))
               let save = fs.writeFileSync(media, buffer)
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
               client.reply(m.chat, global.status.wait, m)
               const media = await client.saveMediaMessage(m.quoted ? m.quoted : m.msg)
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
               client.reply(m.chat, Func.texted('bold', `🚩 This feature only for audio / video.`), m)
            }
         }
      } catch (e) {
         console.log(e)
         return client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   cache: true,
   location: __filename
}