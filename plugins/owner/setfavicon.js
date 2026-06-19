export const run = {
   usage: ['setfavicon'],
   use: 'reply foto',
   category: 'owner',
   async: async (m, {
      client,
      setting,
      Utils
   }) => {
      try {
         const q = m.quoted ? m.quoted : m
         const mime = (q.msg || q).mimetype || ''
         if (!/image/.test(mime)) return client.reply(m.chat, Utils.texted('bold', `🚩 Image not found.`), m)
         client.sendReact(m.chat, '🕒', m.key)
         const buffer = await q.download()
         if (!buffer) throw new Error(global.status.wrong)
         setting.icon = Buffer.from(buffer).toString('base64')
         client.reply(m.chat, Utils.texted('bold', `🚩 Icon successfully set.`), m)
      } catch (e) {
         return client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   owner: true
}