exports.run = {
   usage: ['coin'],
   async: async (m, {
      client,
      args
   }) => {
      if (!global.setting.games) return client.reply(m.chat, Func.texted('bold', `Game features are temporarily disabled by the owner.`), m)
      if (!global.groups[m.chat].game) return client.reply(m.chat, Func.texted('bold', `Game features are not activated in this group.`), m)
      let user = global.users[m.sender]
      if (!args || !args[0]) return client.reply(m.chat, Func.texted('bold', `Give coin type A or B`), m)
      if (user.point == 0) return client.reply(m.chat, Func.texted('bold', `You have no points to play coin.`), m)
      if (user.point < 300000) return client.reply(m.chat, Func.texted('bold', `To play the game points at least you must have 300k points.`), m)
      let x = Func.ucword(args[0])
      if (x == 'A' || x == 'B') {
         var type = Func.random(['A', 'B'])
         var reward = Func.randomInt(100000, user.point)
         setTimeout(async () => {
            if (Func.ucword(args[0]) == type) {
               user.point += reward
               let last = user.point
               let teks = `❏  *W I N*\n\n`
               teks += `	*System* : ${type}, *You* : ${Func.ucword(args[0])}!\n`
               teks += `	*+ ${Func.formatNumber(reward)}*\n\n`
               teks += `• *Total* : ${Func.formatNumber(last)} Points\n\n`
               teks += `*NB : “Anti-Spam pause 5 seconds, the BOT will not respond please repeat after 5 seconds have elapsed.”*`
               client.reply(m.chat, teks, m)
            } else if (Func.ucword(args[0]) != type) {
               user.point -= reward
               let last = user.point
               let teks = `❏  *L O S E*\n\n`
               teks += `	*System* : ${type}, *You* : ${Func.ucword(args[0])}!\n`
               teks += `	*- ${Func.formatNumber(reward)}*\n\n`
               teks += `• *Total* : ${Func.formatNumber(last)} Points\n\n`
               teks += `*NB : “Anti-Spam pause 5 seconds, the BOT will not respond please repeat after 5 seconds have elapsed.”*`
               client.reply(m.chat, teks, m)
            }
         }, 1000)
      } else {
         return client.reply(m.chat, Func.texted('bold', `There are only types A and B.`), m)
      }
   },
   group: true,
   limit: true
}