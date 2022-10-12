exports.run = {
   usage: ['take'],
   hidden: ['wm'],
   use: 'packname | author',
   category: 'converter',
   async: async (m, {
      client,
      text,
      isPrefix
   }) => {
      try {
         if (!text) return client.reply(m.chat, Func.texted('bold', `🚩 Give a text to make watermark.`), m)
         let [packname, ...author] = text.split`|`
         author = (author || []).join`|`
         let q = m.quoted ? m.quoted : m
         let mime = (q.msg || q).mimetype || ''
         if (!/webp/.test(mime)) return client.reply(m.chat, Func.texted('bold', `🚩 Reply to the sticker you want to change the watermark.`), m)
         let img = await q.download()
         if (!img) return client.reply(m.chat, global.status.wrong, m)
         client.sendSticker(m.chat, img, m, {
            packname: packname || '',
            author: author || ''
         })
      } catch (e) {
         console.log(e)
         return client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   cache: true,
   location: __filename
}