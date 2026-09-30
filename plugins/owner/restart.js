export const run = {
   usage: ['restart'],
   category: 'owner',
   async: async (m, {
      client,
      system,
      Utils
   }) => {
      try {
         await client.reply(m.chat, Utils.texted('bold', 'Restarting . . .'), m).then(async () => {
            await system.database.save(global.db)
            process.send('reset')
         })
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   owner: true
}