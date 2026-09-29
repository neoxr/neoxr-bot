export const run = {
   usage: ['group'],
   use: 'open / close',
   category: 'admin tools',
   async: async (m, {
      client,
      args,
      Utils
   }) => {
      try {
         if (!args || !args[0]) return client.reply(m.chat, Utils.texted('bold', `❌ Enter argument close or open.`), m)
         if (args[0] == 'open') {
            await client.groupSettingUpdate(m.chat, 'not_announcement')
         } else if (args[0] == 'close') {
            await client.groupSettingUpdate(m.chat, 'announcement')
         }
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   admin: true,
   botAdmin: true
}