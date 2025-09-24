export const run = {
   usage: ['restart'],
   category: 'owner',
   async: async (m, {
      client,
      system,
      Utils
   }) => {
      await client.reply(m.chat, Utils.texted('bold', 'Restarting . . .'), m).then(async () => {
         await system.database.save(global.db)
         process.send('reset')
      })
   },
   owner: true
}