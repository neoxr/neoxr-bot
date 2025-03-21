exports.run = {
   usage: ['restart'],
   category: 'owner',
   async: async (m, {
      client,
      database,
      Func
   }) => {
      await client.reply(m.chat, Func.texted('bold', 'Restarting . . .'), m).then(async () => {
         await database.save(global.db)
         process.send('reset')
      })
   },
   owner: true
}