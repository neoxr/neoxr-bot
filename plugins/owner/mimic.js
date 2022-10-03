exports.run = {
   usage: ['+mimic', '-mimic'],
   use: 'mention or reply',
   category: 'owner',
   async: async (m, {
      client,
      text,
      isPrefix,
      command
   }) => {
      let number = isNaN(text) ? (text.startsWith('+') ? text.replace(/[()+\s-]/g, '') : (text).split`@` [1]) : text
      if (!text && !m.quoted) return client.reply(m.chat, Func.texted('bold', `🚩 Mention or Reply chat target.`), m)
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
         let people = global.db.setting
         if (command == '+mimic') {
            if (people.mimic.includes(user)) return client.reply(m.chat, Func.texted('bold', `🚩 @${user.replace(/@.+/, '')} was previously added to mimic.`), m)
            people.mimic.push(user)
            client.reply(m.chat, Func.texted('bold', `🚩 Successfully added @${user.replace(/@.+/, '')} to mimic.`), m)
         } else if (command == '-mimic') {
            if (!people.mimic.includes(user)) return client.reply(m.chat, Func.texted('bold', `🚩 @${user.replace(/@.+/, '')} is not in the mimic database.`), m)
            people.mimic.forEach((data, index) => {
               if (data === user) people.mimic.splice(index, 1)
            })
            client.reply(m.chat, Func.texted('bold', `🚩 Successfully removing @${user.replace(/@.+/, '')} from mimic.`), m)
         }
      }
   },
   owner: true
}