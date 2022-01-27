exports.run = {
   usage: ['spin'],
   async: async (m, {
      client,
      args
   }) => {
      if (!global.setting.games) return client.reply(m.chat, Func.texted('bold', `Game features are temporarily disabled by the owner.`), m)
      if (!global.groups[m.chat].game) return client.reply(m.chat, Func.texted('bold', `Game features are not activated in this group.`), m)
      let user = global.users[m.sender]
      if (user.point > 500000) return client.reply(m.chat, Func.texted('bold', `Your point has reached 500K please play the coin game.`), m)
      if (!args || !args[0] || args[0].startsWith('0')) return client.reply(m.chat, Func.texted('bold', `Give the nominal points to be spin.`), m)
      if (isNaN(args[0])) return client.reply(m.chat, Func.texted('bold', `Points must be numbers`), m)
      if (args[0] > user.point) return client.reply(m.chat, Func.texted('bold', `Your points are not enough to spin with ${Func.formatNumber(args[0])} points.`), m)
      if (args[0] < 1000) return client.reply(m.chat, Func.texted('bold', `Can't spin below 1000 points.`), m)
      user.point -= args[0]
      setTimeout(async () => {
         let reward = Func.randomInt(100, args[0] * 3)
         user.point += reward
         let last = user.point
         let teks = `❏  *S P I N - R E S U L T*\n\n`
         teks += `	*- ${Func.formatNumber(args[0])}*\n`
         teks += `	*+ ${Func.formatNumber(reward)}*\n\n`
         teks += `• *Total* : ${Func.formatNumber(last)} Points\n\n`
         teks += `*NB : “Anti-Spam pause 5 seconds after the previous spin, the BOT will not respond please repeat after 5 seconds have elapsed.”*`
         client.reply(m.chat, teks, m)
      }, 1000)
   },
   group: true,
   limit: true
}