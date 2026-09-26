import { upload } from '@neoxr/helper'

export const run = {
   usage: ['setcover'],
   hidden: ['cover'],
   use: 'reply foto',
   category: 'owner',
   async: async (m, {
      client,
      setting,
      Utils
   }) => {
      try {
         const q = m.quoted ? m.quoted : m
         const mime = (q.msg || q).mtype
         if (!/image/i.test(mime)) return client.reply(m.chat, `❌ Image not found.`, m)

         const buffer = await q.download()
         if (!buffer) throw new Error(global.status.wrong)

         const result = await upload(buffer)
         if (!result.status) return client.reply(m.chat, result.msg, m)

         setting.cover = result.data.url
         client.reply(m.chat, `✅ Cover successfully set.`, m)
      } catch (e) {
         console.error(e)
         return client.reply(m.chat, global.status.error, m)
      }
   },
   owner: true
}