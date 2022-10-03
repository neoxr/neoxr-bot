exports.run = {
   usage: ['+owner', '-owner'],
   use: 'mention or reply',
   category: 'owner',
   async: async (m, {
      client,
      text,
      isPrefix,
      command
   }) => {
      let owners = global.db.setting.owners
      let number = isNaN(text) ? (text.startsWith('+') ? text.replace(/[()+\s-]/g, '') : (text).split`@` [1]) : text
      if (!text && !m.quoted) return client.reply(m.chat, Func.texted('bold', `🚩 Mention or Reply chat target.`), m)
      if (isNaN(number)) return client.reply(m.chat, Func.texted('bold', `🚩 Invalid number.`), m)
      if (number.length > 15) return client.reply(m.chat, Func.texted('bold', `🚩 Invalid format.`), m)
      try {
         if (text) {
            var user = number
         } else if (m.quoted.sender) {
            var user = m.quoted.sender.replace(/@.+/, '')
         } else if (m.mentionedJid) {
            var user = number
         }
      } catch (e) {} finally {
         if (command == '+owner') {
            if (owners.includes(user)) return client.reply(m.chat, Func.texted('bold', `🚩 Target is already the owner.`), m)
            owners.push(user)
            client.reply(m.chat, Func.texted('bold', `🚩 Successfully added @${user} as owner.`), m)
         } else if (command == '-owner') {
            if (!owners.includes(user)) return client.reply(m.chat, Func.texted('bold', `🚩 Target is not owner.`), m)
            owners.forEach((data, index) => {
               if (data === user) owners.splice(index, 1)
            })
            client.reply(m.chat, Func.texted('bold', `🚩 Successfully removing @${user} from owner list.`), m)
         }
      }
   },
   owner: true
}