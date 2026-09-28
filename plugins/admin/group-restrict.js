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
         const [opt] = args || []
         const option = opt?.toLowerCase()

         if (!option || !['open', 'close'].includes(option)) {
            return client.reply(m.chat, Utils.texted('bold', '❌ Enter argument open or close.'), m)
         }

         await client.groupSettingUpdate(m.chat, option === 'open' ? 'not_announcement' : 'announcement')
         client.reply(m.chat, Utils.texted('bold', `✅ Group has been successfully ${option === 'open' ? 'opened' : 'closed'}.`), m)
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   group: true,
   admin: true,
   botAdmin: true
}
