export const run = {
   usage: ['setlink'],
   use: 'url',
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
         if (!text) return client.reply(m.chat, Utils.example(isPrefix, command, setting.link), m)
         const isUrl = Utils.isUrl(text)
         if (!isUrl) return client.reply(m.chat, Utils.texted('bold', `❌ URL is invalid.`), m)
         setting.link = text
         client.reply(m.chat, Utils.texted('bold', `✅ Link successfully set.`), m)
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   owner: true
}
