exports.run = {
   usage: ['ban', 'unban'],
   async: async (m, {
      client,
      text,
      command,
      participants
   }) => {
      let number = isNaN(text) ? (text.startsWith('+') ? text.replace(/[()+\s-]/g, '') : (text).split`@` [1]) : text
      if (!text && !m.quoted) return client.reply(m.chat, Func.texted('bold', `Mention or Reply chat target.`), m)
      if (isNaN(number)) return client.reply(m.chat, Func.texted('bold', `Invalid number.`), m)
      if (number.length > 15) return client.reply(m.chat, Func.texted('bold', `Invalid format.`), m)
      try {
         if (text) {
            var user = number + '@s.whatsapp.net'
         } else if (m.quoted.sender) {
            var user = m.quoted.sender
         } else if (m.mentionedJid) {
            var user = number + '@s.whatsapp.net'
         }
      } catch (e) {} finally {
         let userF = global.users
         let ownerF = [global.client.user.id.split`@` [0], global.owner, ...global.setting.owners].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(user)
         if (typeof userF[user] == 'undefined') return client.reply(m.chat, Func.texted('bold', `Can't find user data.`), m)
         if (command == 'ban') {
            if (ownerF) return client.reply(m.chat, Func.texted('bold', `You can't banned owner number.`), m)
            if (user == client.user.id) return client.reply(m.chat, Func.texted('bold', `The fuck?`), m)
            if (userF[user].banned) return client.reply(m.chat, Func.texted('bold', `Target already banned.`), m)
            userF[user].banned = true
            let banned = 0
            for (let jid in userF) {
               if (userF[jid].banned) banned++
            }
            client.reply(m.chat, `❏  *B A N N E D*\n\n*“Successfully to put @${user.split`@`[0]} in the banned list.”*\n\n*Total : ${banned}*`, m)
         } else if (command == 'unban') {
            if (!userF[user].banned) return client.reply(m.chat, Func.texted('bold', `Target not banned.`), m)
            userF[user].banned = false
            let banned = 0
            for (let jid in userF) {
               if (userF[jid].banned) banned++
            }
            client.reply(m.chat, `❏  *U N B A N N E D*\n\n*“Now @${user.split`@`[0]} can using BOT again.”*\n\n*Total : ${banned}*`, m)
         }
      }
   },
   owner: true,
   cache: true,
   location: __filename
}