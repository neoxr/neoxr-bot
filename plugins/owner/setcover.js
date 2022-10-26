exports.run = {
   usage: ['setcover'],
   hidden: ['cover'],
   use: 'reply foto',
   category: 'owner',
   async: async (m, {
      client
   }) => {
      let setting = global.db.setting
      try {
         let q = m.quoted ? m.quoted : m
         let mime = (q.msg || q).mimetype || ''
         if (!/image/.test(mime)) return client.reply(m.chat, Func.texted('bold', `🚩 Image not found.`), m)
         client.sendReact(m.chat, '🕒', m.key)
         let img = await q.download()
         if (!img) return client.reply(m.chat, global.status.wrong, m)
         let link = await scrap.uploadImage(img)
         setting.cover = link
         client.reply(m.chat, Func.texted('bold', `🚩 Cover successfully set.`), m)
      } catch {
         return client.reply(m.chat, global.status.error, m)
      }
   },
   owner: true,
   cache: true,
   location: __filename
}