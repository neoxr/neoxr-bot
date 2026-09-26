export const run = {
   usage: ['setlink'],
   use: 'link',
   category: 'owner',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      setting,
      Utils
   }) => {
      try {
         const [url] = args

         if (!url) {
            return client.reply(m.chat, `Specify the URL link.\nExample: ${isPrefix + command} https://t.me/yourchannel`, m)
         }

         const link = url.trim()
         const isValid = Utils.isUrl(link)

         if (!isValid) {
            return client.reply(m.chat, '❌ Invalid URL format. Please provide a valid HTTP or HTTPS web link.', m)
         }

         setting.link = link
         client.reply(m.chat, `✅ Link successfully set to: ${link}`, m)
      } catch (e) {
         console.error(e)
         return client.reply(m.chat, global.status.error, m)
      }
   },
   owner: true
}