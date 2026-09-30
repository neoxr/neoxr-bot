export const run = {
   usage: ['ping'],
   category: 'miscs',
   async: async (m, {
      client
   }) => {
      try {
         const start = Date.now()
         const msg = await client.reply(m.chat, 'Checking ...', m)
         const end = Date.now()
         client.sendMessage(m.chat, {
            text: `✨ Speed : [ ${end - start}ms ]`,
            edit: msg.key
         })
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false
}