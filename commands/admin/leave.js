exports.run = {
   usage: ['leave'],
   async: async (m, {
      client
   }) => {
      await client.reply(m.chat, Func.texted('bold', `Good bye :)`), m).then(async () => {
         await Func.delay(3000).then(async () => await client.groupLeave(m.chat))
      })
   },
   group: true,
   admin: true
}