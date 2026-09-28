import { upload } from '@neoxr/helper'

export const run = {
   usage: ['flip', 'flop'],
   use: 'reply sticker',
   category: 'utilities',
   async: async (m, {
      client,
      command,
      setting,
      Utils,
      limitter
   }) => {
      try {
         const q = m.quoted ? m.quoted : m
         const mime = client.message.get(q)?.mimetype || ''

         if (!/webp/i.test(mime)) {
            return client.reply(m.chat, Utils.texted('bold', `❌ Reply to the sticker you want to ${command.toLowerCase()}.`), m)
         }

         await client.sendReact(m.chat, '🕒', m.key)

         const buffer = await q.download()
         if (!buffer) return client.reply(m.chat, Utils.texted('bold', '❌ Failed to download sticker.'), m)

         const file = await upload(buffer)
         if (!file?.data?.url) return client.reply(m.chat, global.status.fail, m)

         const json = await Api.neoxr(`/${command.toLowerCase()}`, {
            url: file.data.url
         })
         if (!json.status) return client.reply(m.chat, `❌ ${json.msg || 'An error occurred while processing the data.'}`, m)

         const result = await Utils.fetchAsBuffer(json.data.url)

         client.sendSticker(m.chat, result, m, {
            packname: setting.sk_pack,
            author: setting.sk_author,
            meta: true
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
