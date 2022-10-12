exports.run = {
   usage: ['afk'],
   use: 'reason (optional)',
   category: 'group',
   async: async (m, {
      client,
      text
   }) => {
      try {
         let user = global.db.users[m.sender]
         user.afk = +new Date
         user.afkReason = text
         let tag = m.sender.split`@` [0]
         return client.reply(m.chat, Func.texted('bold', `🚩 @${tag} is now AFK!`), m)
      } catch {
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   group: true
}