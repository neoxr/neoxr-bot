exports.run = {
   usage: ['getstory'],
   hidden: ['getsw'],
   use: 'reply story',
   async: async (m, {
      client
   }) => {
      try {
         if (!m.quoted) return client.reply(m.chat, Func.texted('bold', `🚩 Reply to someone's story.`), m)
         if (!/broadcast/i.test(m.quoted.chat)) return client.reply(m.chat, Func.texted('bold', `🚩 Reply to someone's story.`), m)
         return client.copyNForward(m.chat, m.quoted.fakeObj)
      } catch (e) {
         console.log(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   owner: true
}