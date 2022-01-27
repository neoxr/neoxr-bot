exports.run = {
   usage: ['setprefix', 'addprefix', 'delprefix'],
   async: async (m, {
      client,
      args,
      isPrefix,
      command
   }) => {
      let system = global.setting
      let ignore = ['>', '=', '$', '%', '?']
      if (command == 'setprefix') {
         if (!args || !args[0]) return client.reply(m.chat, `• ${Func.texted('bold', 'Example')} : ${isPrefix + command} #`, m)
         if (args[0].length > 1) return client.reply(m.chat, Func.texted('bold', `Give only one prefix.`), m)
         if (ignore.includes(args[0])) return client.reply(m.chat, Func.texted('bold', `Can't add prefix ${args[0]} because an error will occur.`), m)
         if (args[0] == system.prefix) return client.reply(m.chat, Func.texted('bold', `The prefix you provide is the prefix currently in use.`), m)
         system.onlyprefix = args[0]
         global.save
         client.reply(m.chat, Func.texted('bold', `Prefix has been changed to : ${args[0]}`), m)
      } else if (command == 'addprefix') {
         if (!args || !args[0]) return client.reply(m.chat, `• ${Func.texted('bold', 'Example')} : ${isPrefix + command} #`, m)
         if (args[0].length > 1) return client.reply(m.chat, Func.texted('bold', `Give only one prefix.`), m)
         if (ignore.includes(args[0])) return client.reply(m.chat, Func.texted('bold', `Can't add prefix ${args[0]} because an error will occur.`), m)
         if (system.prefix.includes(args[0])) return client.reply(m.chat, Func.texted('bold', `The prefix is ​​already in the database.`), m)
         system.prefix.push(args[0])
         client.reply(m.chat, Func.texted('bold', `Prefix ${args[0]} successfully added.`), m)
      } else if (command == 'delprefix') {
         if (!args || !args[0]) return client.reply(m.chat, `• ${Func.texted('bold', 'Example')} : ${isPrefix + command} #`, m)
         if (args[0].length > 1) return client.reply(m.chat, Func.texted('bold', `Give only one prefix.`), m)
         if (setting.prefix.lenght < 2) return client.reply(m.chat, Func.texted('bold', `Sorry, you can't remove more prefix.`), m)
         if (!system.prefix.includes(args[0])) return client.reply(m.chat, Func.texted('bold', `Prefix ${args[0]} not in database.`), m)
         system.prefix.forEach((data, index) => {
            if (data === args[0]) system.prefix.splice(index, 1)
         })
         client.reply(m.chat, Func.texted('bold', `Prefix ${args[0]} has been removed.`), m)
      }
   },
   owner: true,
   cache: true,
   location: __filename
}