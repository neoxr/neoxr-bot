export const run = {
   usage: ['ping'],
   category: 'miscs',
   async: async (m, {
      client
   }) => {
      const start = Date.now()
      const msg = await client.reply(m.chat, 'Checking ...', m)
      const end = Date.now()
      client.sendMessage(m.chat, {
         text: `✨ Speed : [ ${end - start}ms ]`,
         edit: msg.key
      })
   },
   error: false
}