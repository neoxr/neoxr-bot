exports.run = {
   usage: ['db'],
   async: async (m, {
      client,
      args,
      isPrefix
   }) => {
      let day = 86400000 * 1,
         now = new Date() * 1
      let user = 0,
         chat = 0,
         limit = 0,
         group = 0
      if (args[0] == 'clean') {
         Object.entries(global.users).map(([v, x]) => {
            if (now - x.lastseen > day && !x.premium) {
               delete global.users[v]
               user += 1
            }
         })
         Object.entries(global.chats).map(([v, x]) => {
            if (now - x.lastseen > day && !x.premium) {
               delete global.chats[v]
               chat += 1
            }
         })
         Object.entries(global.groups).map(async ([v, x]) => {
            if (now - x.activity > day && !x.stay && x.expired == 0) {
               delete global.groups[v]
               await Func.delay(3000).then(async () => await client.groupLeave(v))
               group += 1
            }
         })
         client.reply(m.chat, Func.texted('bold', `Successfully deleted ${user} users and ${chat} chats.`), m)
      } else {
         Object.entries(global.users).map(([v, x]) => {
            if (now - x.lastseen > day && !x.premium) user += 1
         })
         Object.entries(global.chats).map(([v, x]) => {
            if (now - x.lastseen > day && !x.premium) chat += 1
         })
         Object.entries(global.users).map(([v, x]) => {
            if (/-/.test(x.limit)) limit += 1
         })
         Object.entries(global.groups).map(([v, x]) => {
            if (now - x.activity > day && !x.stay && x.expired == 0) group += 1
         })
         let text = `❏  *D B - C L E A N*\n\n`
         text += `There are ${Func.texted('bold', user)} users, ${Func.texted('bold', chat)} chats, ${Func.texted('bold', group)} groups, that are inactive for 1 day, and ${Func.texted('bold', limit)} user data limit minus\n\n`
         text += `Send ${Func.texted('bold', `${isPrefix}db clean`)} to delete data.`
         client.reply(m.chat, text, m)
      }
   },
   owner: true
}