const fs = require('fs')
const path = require('path')
const {
   exec
} = require('child_process')
const {
   tmpdir
} = require('os')
exports.run = {
   usage: ['toimg'],
   async: async (m, {
      client
   }) => {
      try {
         if (!m.quoted) return client.reply(m.chat, Func.texted('bold', `Reply sticker you want to convert with this command.`), m)
         if (m.quoted.mimetype != 'image/webp') return client.reply(m.chat, Func.texted('bold', `Reply sticker you want to convert with this command.`), m)
         let media = await client.saveMediaMessage(m.quoted)
         let file = Func.filename('png')
         let isFile = path.join(tmpdir(), file)
         exec(`ffmpeg -i ${media} ${isFile}`, (err, stderr, stdout) => {
            fs.unlinkSync(media)
            if (err) return client.reply(m.chat, Func.texted('bold', `Convert failed!`), m)
            buffer = fs.readFileSync(isFile)
            client.sendImage(m.chat, buffer, '', m)
            fs.unlinkSync(isFile)
         })
      } catch {
         return client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   cache: true,
   location: __filename
}