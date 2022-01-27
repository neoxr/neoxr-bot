exports.run = {
   usage: ['limit'],
   async: async (m, {
      client,
      isPrefix,
      isOwner,
      isPrem
   }) => {
      let user = global.users[m.sender]
      if (isOwner || isPrem) return client.reply(m.chat, Func.texted('bold', `Your limit is Unlimited.`), m)
      if (user.limit == 0) return client.reply(m.chat, `Sorry @${m.sender.split`@`[0]}, you don't have a limit please exchange / buy it with your points first, send me *${isPrefix}buy 1* for example.`, m)
      client.reply(m.chat, Func.texted('bold', `You have ${Func.formatNumber(user.limit)} limits.`), m)
   },
   error: false
}