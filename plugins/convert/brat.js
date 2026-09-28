export const run = {
   usage: ['brat'],
   use: 'text',
   category: 'converter',
   async: async (m, {
      client,
      limitter,
      setting,
      text,
      isPrefix,
      command,
      Utils
   }) => {
      try {
         let exif = setting
         if (!text) return client.reply(m.chat, Utils.example(isPrefix, command, 'neoxr bot'), m)
         if (text.length > 30) return client.reply(m.chat, Utils.texted('bold', `❌ Max 30 character.`), m)
         client.sendReact(m.chat, '🕒', m.key)
         const json = await Api.neoxr('/brat', {
            text
         })
         if (!json.status) return client.reply(m.chat, Utils.texted('bold', `❌ Can't generate brat sticker.`), m)
         await client.sendSticker(m.chat, json.data.url, m, {
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