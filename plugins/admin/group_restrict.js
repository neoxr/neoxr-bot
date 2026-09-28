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
         const [argumen] = args
         if (!args || !argumen) return client.reply(m.chat, Utils.texted('bold', `❌ Enter argument close or open.`), m)
         if (argumen == 'open') {
            await client.groupSettingUpdate(m.chat, 'not_announcement')
         } else if (argumen == 'close') {
            await client.groupSettingUpdate(m.chat, 'announcement')
         }

      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   group: true,
   admin: true,
   botAdmin: true
}