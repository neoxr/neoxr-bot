// Set Cover
neoxr.create(async (m, {
   client,
   Func,
   Scraper
}) => {
   try {
      let setting = global.db.setting
      let q = m.quoted ? m.quoted : m
      let mime = (q.msg || q).mimetype || ''
      if (!/image/.test(mime)) return client.reply(m.chat, Func.texted('bold', `🚩 Image not found.`), m)
      client.sendReact(m.chat, '🕒', m.key)
      let img = await q.download()
      if (!img) return client.reply(m.chat, global.status.wrong, m)
      let link = await Scraper.uploadImage(img)
      setting.cover = link
      client.reply(m.chat, Func.texted('bold', `🚩 Cover successfully set.`), m)
   } catch (e) {
      return client.reply(m.chat, Func.jsonFormat(e), m)
   }
}, {
   usage: ['setcover'],
   hidden: ['cover'],
   use: 'reply foto',
   category: 'owner',
   owner: true
}, __filename)