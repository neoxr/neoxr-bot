import { upload } from '@neoxr/helper'

export const run = {
   usage: ['removebg'],
   hidden: ['nobg'],
   use: 'reply photo',
   category: 'utilities',
   async: async (m, {
      client,
      Utils,
      limitter
   }) => {
      try {
         const q = m.quoted ? m.quoted : m
         const mime = client.message.get(q)?.mimetype || ''

         if (!/image\/(jpe?g|png)/i.test(mime)) {
            return client.reply(m.chat, Utils.texted('bold', '❌ Reply to or send a photo.'), m)
         }

         await client.sendReact(m.chat, '🕒', m.key)

         const buffer = await q.download()
         if (!buffer) return client.reply(m.chat, Utils.texted('bold', '❌ Failed to download image.'), m)

         const image = await upload(buffer)
         if (!image?.data?.url) return client.reply(m.chat, global.status.fail, m)

         const json = await Api.neoxr('/nobg', {
            image: image.data.url
         })
         if (!json.status) return client.reply(m.chat, `❌ ${json.msg || 'An error occurred while processing the data.'}`, m)

         client.sendFile(m.chat, json.data.no_background, 'image.png', '', m)
         limitter()
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   limit: true,
   premium: true
}
