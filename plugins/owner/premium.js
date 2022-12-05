exports.run = {
   usage: ['+prem', '-prem'],
   use: 'mention or reply',
   category: 'owner',
   async: async (m, {
      client,
      text,
      command
   }) => {
      let number = isNaN(text) ? (text.startsWith('+') ? text.replace(/[()+\s-]/g, '') : (text).split`@` [1]) : text
      if (!text && !m.quoted) return client.reply(m.chat, Func.texted('bold', `🚩 Mention or reply chat target.`), m)
      if (isNaN(number)) return client.reply(m.chat, Func.texted('bold', `🚩 Invalid number.`), m)
      if (number.length > 15) return client.reply(m.chat, Func.texted('bold', `🚩 Invalid format.`), m)
      try {
         if (text) {
            var user = number + '@s.whatsapp.net'
         } else if (m.quoted.sender) {
            var user = m.quoted.sender
         } else if (m.mentionedJid) {
            var user = number + '@s.whatsapp.net'
         }
      } catch (e) {} finally {
         let data = global.db.users.find(v => v.jid == user)
         if (typeof data == 'undefined') return client.reply(m.chat, Func.texted('bold', `🚩 Can't find user data.`), m)
         if (command == '+prem') {
            if (data.premium) return client.reply(m.chat, Func.texted('bold', `🚩 @${user.replace(/@.+/, '')} has become registered as a premium account.`), m)
            data.limit += 1000
            data.premium = true
            data.expired = (new Date() * 1) + (86400000 * 30)
            client.reply(m.chat, Func.texted('bold', `🚩 Successfully added @${user.replace(/@.+/, '')} to premium user.`), m)
         } else if (command == '-prem') {
            if (!data.premium) return client.reply(m.chat, Func.texted('bold', `🚩 Not a premium account.`), m)
            data.limit = global.limit
            data.premium = false
            data.expired = 0
            client.reply(m.chat, Func.texted('bold', `🚩 @${user.replace(/@.+/, '')}'s premium status has been successfully deleted.`), m)
         }
      }
   },
   error: false,
   owner: true,
   cache: true,
   location: __filename
}