const { webp2mp4 } = require('../../lib/webp2mp4')
const { ffmpeg } = require('@neoxr/wb/system/converter')
exports.run = {
   usage: ['tovideo'],
   use: 'reply sticker',
   category: 'converter',
   async: async (m, {
      client,
      Func
   }) => {
      try {
        let mime = m.quoted.mimetype || ''
        if (!m.quoted) return client.reply(m.chat, Func.texted('bold', `🚩 Reply to sticker you want to convert to video.`), m)
        if (!/webp|audio/.test(mime)) return client.reply(m.chat, Func.texted('bold', `🚩 Reply to sticker you want to convert to video.`), m)
        client.sendReact(m.chat, '🕒', m.key)
        let media = await m.quoted.download()
        let out = Buffer.alloc(0)
        if (/webp/.test(mime)) {
            out = await webp2mp4(media)
        } else if (/audio/.test(mime)) {
            out = await ffmpeg(media, [
                '-filter_complex', 'color',
                '-pix_fmt', 'yuv420p',
                '-crf', '51',
                '-c:a', 'copy',
                '-shortest'
            ], 'mp3', 'mp4')
        }
        await client.sendFile(m.chat, out, '', 'done', m)
      } catch (e) {
         console.log(e)
         return client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true,
   cache: true,
   location: __filename
}
