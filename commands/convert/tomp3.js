const fs = require('fs')
const {
   exec
} = require('child_process')
exports.run = {
   usage: ['tomp3', 'toaudio', 'tovn'],
   async: async (m, {
      client,
      command
   }) => {
      try {
         if (m.quoted && typeof m.quoted.buttons != 'undefined' && typeof m.quoted.videoMessage != 'undefined') {
            client.reply(m.chat, global.status.wait, m)
            let media = await client.saveMediaMessage(m.quoted.videoMessage)
            let ran = Func.filename('mp3')
            exec(`ffmpeg -i ${media} ${ran}`, async (err, stderr, stdout) => {
               fs.unlinkSync(media)
               if (err) return client.reply(m.chat, Func.texted('bold', `Convert failed!`), m)
               let buff = fs.readFileSync(ran)
               if (/tomp3|toaudio/.test(command)) return client.sendFile(m.chat, buff, 'audio.mp3', '', m).then(() => {
                  fs.unlinkSync(ran)
               })
               if (/tovn/.test(command)) return client.sendFile(m.chat, buff, 'audio.mp3', '', m, {
                  ptt: true
               }).then(() => {
                  fs.unlinkSync(ran)
               })
            })
         } else {
            let mime = ((m.quoted ? m.quoted : m.msg).mimetype || '')
            if (/audio|video/.test(mime)) {
               client.reply(m.chat, global.status.wait, m)
               let media = await client.saveMediaMessage(m.quoted ? m.quoted : m.msg)
               let ran = Func.filename('mp3')
               exec(`ffmpeg -i ${media} ${ran}`, async (err, stderr, stdout) => {
                  fs.unlinkSync(media)
                  if (err) return client.reply(m.chat, Func.texted('bold', `Convert failed!`), m)
                  let buff = fs.readFileSync(ran)
                  if (/tomp3|toaudio/.test(command)) return client.sendFile(m.chat, buff, 'audio.mp3', '', m).then(() => {
                     fs.unlinkSync(ran)
                  })
                  if (/tovn/.test(command)) return client.sendFile(m.chat, buff, 'audio.mp3', '', m, {
                     ptt: true
                  }).then(() => {
                     fs.unlinkSync(ran)
                  })
               })
            } else {
               client.reply(m.chat, Func.texted('bold', `Only for audio or video.`), m)
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