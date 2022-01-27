exports.run = {
   usage: ['disable', 'enable'],
   async: async (m, {
      client,
      args,
      isPrefix,
      command
   }) => {
      let cmd = global.setting
      if (!args || !args[0]) return client.reply(m.chat, `• *Example* : ${isPrefix + command} tiktok`, m)

      function join(arr) {
         var construct = []
         for (var i = 0; i < arr.length; i++) construct = construct.concat(arr[i])
         return construct
      }
      let cmds = Object.values(client.commands)
      let collect = []
      for (let i = 0; i < cmds.length; i++) collect.push(cmds[i].run.usage)
      if (!join(collect).includes(args[0])) return client.reply(m.chat, Func.texted('bold', `Sorry, command ${isPrefix + args[0]} is not in the menu list.`), m)
      if (command == 'disable') {
         if (cmd.errorCmd.includes(args[0])) return client.reply(m.chat, Func.texted('bold', `Command ${isPrefix + args[0]} is already disabled.`), m)
         cmd.errorCmd.push(args[0])
         client.reply(m.chat, Func.texted('bold', `Done!`), m)
      } else if (command == 'enable') {
         if (!cmd.errorCmd.includes(args[0])) return client.reply(m.chat, Func.texted('bold', `Command ${isPrefix + args[0]} not found.`), m)
         cmd.errorCmd.forEach((data, index) => {
            if (data === args[0]) cmd.errorCmd.splice(index, 1)
         });
         client.reply(m.chat, Func.texted('bold', `Done!`), m)
      }
   },
   owner: true
}