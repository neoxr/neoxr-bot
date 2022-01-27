exports.run = {
   usage: ['point'],
   async: async (m, {
      client,
      isPrefix
   }) => {
      let user = global.users[m.sender]
      if (user.point == 0) return client.reply(m.chat, `Sorry @${m.sender.split`@`[0]}, you don't have a point, you can get points by claiming try to send *${isPrefix}claim*`, m)
      client.reply(m.chat, Func.texted('bold', `You have ${Func.simpFormat(Func.formatNumber(user.point))} (${Func.formatNumber(user.point)}) points.`), m)
   },
   error: false
}