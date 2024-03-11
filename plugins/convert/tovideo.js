exports.run = {
   usage: ['tovideo'],
   hidden: ['tovid'],
   use: 'reply gif sticker',
   category: 'converter',
   async: async (m, {
      client,
      command,
      Func,
      Scraper
   }) => {
      try {
         let exif = global.db.setting
         if (!m.quoted) return client.reply(m.chat, Func.texted('bold', `🚩 Reply to gif sticker.`), m)
         let q = m.quoted ? m.quoted : m
         let mime = (q.msg || q).mimetype || ''
         if (!/webp/.test(mime)) return client.reply(m.chat, Func.texted('bold', `🚩 Reply to gif sticker.`), m)
         let buffer = await q.download()
         const file = await Scraper.uploadImageV2(buffer)
         if (!file.status) return m.reply(Func.jsonFormat(file))
         let old = new Date()
         client.sendReact(m.chat, '🕒', m.key)
         const json = await Api.neoxr('/webp2mp4', {
            url: file.data.url
         })
         client.sendFile(m.chat, json.data.url, '', `🍟 *Process* : ${((new Date - old) * 1)} ms`, m)
      } catch (e) {
         return client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   limit: true,
   cache: true,
   location: __filename
}