export const run = {
   usage: ['smeme'],
   use: 'text | text',
   category: 'converter',
   async: async (m, {
      client,
      limitter,
      setting,
      text,
      isPrefix,
      command,
      Utils,
      Scraper
   }) => {
      try {
         let exif = setting
         if (!text) return client.reply(m.chat, Utils.example(isPrefix, command, 'Hi | Dude'), m)
         client.sendReact(m.chat, '🕒', m.key)
         let [top, bottom] = text.split`|`
         if (m.quoted ? m.quoted.message : m.msg.viewOnce) {
            let type = m.quoted ? Object.keys(m.quoted.message)[0] : m.mtype
            let q = m.quoted ? m.quoted.message[type] : m.msg
            if (/image/.test(type)) {
               let img = await client.downloadMediaMessage(q)
               let json = await Scraper.uploadImageV2(img)
               let res = `https://api.memegen.link/images/custom/${encodeURIComponent(top ? top : ' ')}/${encodeURIComponent(bottom ? bottom : '')}.png?background=${json.data.url}`
               client.sendSticker(m.chat, res, m, {
                  packname: exif.sk_pack,
                  author: exif.sk_author
               })
            } else client.reply(m.chat, Utils.texted('bold', `❌ Only for photo.`), m)
         } else {
            let q = m.quoted ? m.quoted : m
            let mime = (q.msg || q).mimetype || ''
            if (!mime) return client.reply(m.chat, Utils.texted('bold', `❌ Reply photo.`), m)
            if (!/image\/(jpe?g|png)/.test(mime)) return client.reply(m.chat, Utils.texted('bold', `❌ Only for photo.`), m)
            let img = await q.download()
            let json = await Scraper.uploadImageV2(img)
            let res = `https://api.memegen.link/images/custom/${encodeURIComponent(top ? top : ' ')}/${encodeURIComponent(bottom ? bottom : '')}.png?background=${json.data.url}`
            client.sendSticker(m.chat, res, m, {
               packname: exif.sk_pack,
               author: exif.sk_author
            })
         }
         limitter()
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   limit: true
}