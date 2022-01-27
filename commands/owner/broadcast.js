exports.run = {
   usage: ['bcgc'],
   async: async (m, {
      client
   }) => {
      if (!m.quoted) return client.reply(m.chat, Func.texted('bold', `Reply Message.`), m)
      let group = await (await client.groupList()).map(v => v.id)
      for (let i = 0; i < group.length; i++) {
         client.copyNForward(group[i], m.quoted.fakeObj)
         await Func.delay(1500)
      }
      client.reply(m.chat, Func.texted('bold', `Successfully send a message into ${group.length} groups.`), m)
   },
   owner: true
}