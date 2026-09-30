export const run = {
   usage: ['setwm'],
   use: 'packname | author',
   category: 'owner',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      Utils,
      setting
   }) => {
      try {
         if (!text) return client.reply(m.chat, Utils.example(isPrefix, command, 'Sticker by | @neoxrs'), m)
         let [packname, ...author] = text.split`|`
         author = (author || []).join`|`
         setting.sk_pack = packname || ''
         setting.sk_author = author || ''
         client.reply(m.chat, Utils.texted('bold', `✅ Sticker Watermark successfully set.`), m)
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   owner: true
}