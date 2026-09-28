import { upload } from '@neoxr/helper'

export const run = {
   usage: ['smeme'],
   use: 'text | text',
   category: 'converter',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      Utils,
      limitter,
      setting
   }) => {
      try {
         let exif = setting
         if (!text) return client.reply(m.chat, Utils.example(isPrefix, command, 'Hi | Dude'), m)
         client.sendReact(m.chat, '🕒', m.key)
         let [top, bottom] = text.split`|`

         let q = m.quoted ? m.quoted : m
         let mime = client.message.get(q).mimetype || ''
         if (!mime) return client.reply(m.chat, Utils.texted('bold', `❌ Reply photo.`), m)
         if (!/image\/(jpe?g|png)/.test(mime)) return client.reply(m.chat, Utils.texted('bold', `❌ Only for photo.`), m)
         let img = await q.download()
         let json = await upload(img)
         let res = `https://api.memegen.link/images/custom/${encodeURIComponent(top ? top : ' ')}/${encodeURIComponent(bottom ? bottom : '')}.png?background=${json.data.url}`
         client.sendSticker(m.chat, res, m, {
            packname: exif.sk_pack,
            author: exif.sk_author
         })
         limitter()
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   limit: true
}
