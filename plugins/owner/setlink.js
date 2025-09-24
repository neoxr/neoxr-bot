export const run = {
   usage: ['setlink'],
   use: 'url',
   category: 'owner',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      Utils
   }) => {
      try {
         let setting = global.db.setting
         if (!text) return client.reply(m.chat, Utils.example(isPrefix, command, global.db.setting.link), m)
         const isUrl = Utils.isUrl(text)
         if (!isUrl) return client.reply(m.chat, Utils.texted('bold', `🚩 URL is invalid.`), m)
         setting.link = text
         client.reply(m.chat, Utils.texted('bold', `🚩 Link successfully set.`), m)
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   owner: true
}