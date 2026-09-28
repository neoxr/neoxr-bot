export const run = {
   usage: ['tovideo'],
   hidden: ['tovid'],
   use: 'reply gif sticker',
   category: 'converter',
   async: async (m, {
      client,
      limitter,
      setting,
      command,
      Utils,
      Scraper
   }) => {
      try {
         let exif = setting
         if (!m.quoted) return client.reply(m.chat, Utils.texted('bold', `❌ Reply to gif sticker.`), m)
         let q = m.quoted ? m.quoted : m
         let mime = (q.msg || q).mimetype || ''
         if (!/webp/.test(mime)) return client.reply(m.chat, Utils.texted('bold', `❌ Reply to gif sticker.`), m)
         let buffer = await q.download()
         const file = await Scraper.uploadImageV2(buffer)
         if (!file.status) return m.reply(Utils.jsonFormat(file))
         let old = new Date()
         client.sendReact(m.chat, '🕒', m.key)
         const json = await Api.neoxr('/webp2mp4', {
            url: file.data.url
         })
         client.sendFile(m.chat, json.data.url, '', `🍟 *Process* : ${((new Date - old) * 1)} ms`, m)
         limitter()
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   limit: true
}