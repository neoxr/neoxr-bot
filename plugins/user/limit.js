export const run = {
   usage: ['limit'],
   category: 'user',
   async: async (m, {
      client,
      isPrefix,
      users,
      Utils
   }) => {
      if (users.limit < 1) return client.reply(m.chat, `🚩 Your bot usage has reached the limit and will be reset at 00.00\n\nTo get more limits, upgrade to a premium plan.`, m)
      client.reply(m.chat, `🍟 Your limit : [ ${Utils.formatter(users.limit)} ]${!users.premium ? `\n\nTo get more limits, upgrade to a premium plan.` : ''}`, m)
   },
   error: false
}