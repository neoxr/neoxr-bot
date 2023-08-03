exports.run = {
   usage: ['restart'],
   category: 'owner',
   async: async (m, {
      client,
      Func
   }) => {
      await client.reply(m.chat, Func.texted('bold', 'Restarting . . .'), m).then(async () => {
         await props.save()
         process.send('reset')
      })
   },
   owner: true
}