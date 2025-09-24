export const run = {
   usage: ['brat'],
   use: 'text',
   category: 'converter',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      Utils
   }) => {
      try {
         let exif = global.db.setting
         if (!text) return client.reply(m.chat, Utils.example(isPrefix, command, 'neoxr bot'), m)
         if (text.length > 30) return client.reply(m.chat, Utils.texted('bold', `🚩 Max 30 character.`), m)
         client.sendReact(m.chat, '🕒', m.key)
         const json = await Api.neoxr('/brat', {
            text
         })
         if (!json.status) return client.reply(m.chat, Utils.texted('bold', `🚩 Can't generate brat sticker.`), m)
         await client.sendSticker(m.chat, json.data.url, m, {
            packname: exif.sk_pack,
            author: exif.sk_author
         })
      } catch (e) {
         return client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true
}