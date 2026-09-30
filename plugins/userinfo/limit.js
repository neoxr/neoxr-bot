export const run = {
   usage: ['limit'],
   category: 'user info',
   async: async (m, {
      client,
      isPrefix,
      users,
      Utils
   }) => {
      try {
         if (users.limit < 1) return client.reply(m.chat, `❌ Your bot usage has reached the limit and will be reset at 00.00\n\nTo get more limits, upgrade to a premium plan send *${isPrefix}premium*`, m)
         client.reply(m.chat, `🍟 Your limit : [ *${Utils.formatNumber(users.limit)}* ]${!users.premium ? `\n\nTo get more limits, upgrade to a premium plan send *${isPrefix}premium*` : ''}`, m)
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false
}