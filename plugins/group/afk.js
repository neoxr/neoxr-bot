export const run = {
   usage: ['afk'],
   use: 'reason (optional)',
   category: 'group',
   async: async (m, {
      client,
      text,
      users,
      Utils
   }) => {
      try {
         client.reply(m.chat, Utils.texted('bold', `✅  @${m.sender.replace(/@.+/, '')} is now AFK!`), m).then(() => {
            users.afk = +new Date
            users.afkReason = text
            users.afkObj = m
         })
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   group: true
}
