exports.run = {
   usage: ['disable', 'enable'],
   use: 'command',
   category: 'owner',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      plugins
   }) => {
      let cmd = global.db.setting
      if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'tiktok'), m)
      let commands = Func.arrayJoin(Object.values(Object.fromEntries(Object.entries(plugins).filter(([name, prop]) => prop.run.usage))).map(v => v.run.usage))
      if (!commands.includes(args[0])) return client.reply(m.chat, Func.texted('bold', `🚩 Command ${isPrefix + args[0]} does not exist.`), m)
      if (command == 'disable') {
         if (cmd.error.includes(args[0])) return client.reply(m.chat, Func.texted('bold', `🚩 ${isPrefix + args[0]} command was previously disabled.`), m)
         cmd.error.push(args[0])
         client.reply(m.chat, Func.texted('bold', `🚩 Command ${isPrefix + args[0]} disabled successfully.`), m)
      } else if (command == 'enable') {
         if (!cmd.error.includes(args[0])) return client.reply(m.chat, Func.texted('bold', `🚩 Command ${isPrefix + args[0]} does not exist.`), m)
         cmd.error.forEach((data, index) => {
            if (data === args[0]) cmd.error.splice(index, 1)
         })
         client.reply(m.chat, Func.texted('bold', `🚩 Command ${isPrefix + args[0]} successfully activated.`), m)
      }
   },
   owner: true
}