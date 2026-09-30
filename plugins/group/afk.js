export const run = {
   usage: ['afk'],
   use: 'reason (optional)',
   category: 'group',
   async: async (m, {
      client,
      text,
      Utils
   }) => {
      try {
         let user = global.db.users.find(v => v.jid == m.sender)
         user.afk = +new Date
         user.afkReason = text
         user.afkObj = m
         let tag = m.sender.split`@`[0]
         return client.reply(m.chat, Utils.texted('bold', `❌ @${tag} is now AFK!`), m)
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   group: true
}