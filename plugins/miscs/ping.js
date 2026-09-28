export const run = {
   usage: ['ping'],
   category: 'miscs',
   async: async (m, {
      client,
      Utils
   }) => {
      try {
         const start = Date.now()
         const origin = await client.reply(m.chat, 'Checking ...', m)
         const end = Date.now()

         client.message.send(m.chat, `✨ Speed : [ ${end - start}ms ]`, {
            editKey: {
               id: origin.id,
               participant: undefined
            }
         })

      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false
}
