export const run = {
   usage: ['emojimix'],
   hidden: ['mix', 'emomix'],
   use: 'emoji + emoji',
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
         if (!text) return client.reply(m.chat, Utils.example(isPrefix, command, '😳+😩'), m)
         client.sendReact(m.chat, '🕒', m.key)
         let [emo1, emo2] = text.split`+`
         if (!emo1 || !emo2) return client.reply(m.chat, Utils.texted('bold', `🚩 Give 2 emoji to mix.`), m)
         const json = await Api.neoxr('/emoji', {
            q: emo1 + '_' + emo2
         })
         if (!json.status) return client.reply(m.chat, Utils.texted('bold', `🚩 Emoji can't be mixed.`), m)
         await client.sendSticker(m.chat, json.data.url, m, {
            packname: exif.sk_pack,
            author: exif.sk_author,
            categories: [emo1, emo2]
         })
      } catch (e) {
         return client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true
}