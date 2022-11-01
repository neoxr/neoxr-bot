exports.run = {
   usage: ['setlink'],
   use: 'url',
   category: 'owner',
   async: async (m, {
      client,
      text,
      isPrefix,
      command
   }) => {
      try {
         let setting = global.db.setting
         if (!text) return client.reply(m.chat, Func.example(isPrefix, command, global.db.setting.link), m)
         const isUrl = Func.isUrl(text)
         if (!isUrl) return client.reply(m.chat, Func.texted('bold', `🚩 URL is invalid.`), m)
         setting.link = text
         client.reply(m.chat, Func.texted('bold', `🚩 Link successfully set.`), m)
      } catch (e) {
         client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   owner: true,
   cache: true,
   location: __filename
}