export const run = {
   usage: ['swm'],
   use: 'packname | author',
   category: 'converter',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      Utils,
      limitter
   }) => {
      try {
         let [packname, ...author] = text.split`|`
         author = (author || []).join`|`
         let q = m.quoted ? m.quoted : m
         let mime = client.message.get(q).mimetype || ''
         if (/image\/(jpe?g|png)/.test(mime)) {
            let img = await q.download()
            if (!img) return client.reply(m.chat, global.status.wrong, m)
            limitter()
            return await client.sendSticker(m.chat, img, m, {
               packname: packname || '',
               author: author || '',
               meta: true
            })
         } else if (/video/.test(mime)) {
            if ((q.msg || q).seconds > 10) return client.reply(m.chat, Utils.texted('bold', `❌ Maximum video duration is 10 seconds.`), m)
            let img = await q.download()
            if (!img) return client.reply(m.chat, global.status.wrong, m)
            limitter()
            return await client.sendSticker(m.chat, img, m, {
               packname: packname || '',
               author: author || '',
               meta: true
            })
         } else client.reply(m.chat, `❌ To create a watermark on sticker reply media photo or video and use this format *${isPrefix + command} packname | author*`, m)

         limitter()
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   limit: true
}
