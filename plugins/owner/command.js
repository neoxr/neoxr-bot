export const run = {
   usage: ['disable', 'enable'],
   use: 'command',
   category: 'owner',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      plugins,
      setting: cmd,
      Utils
   }) => {
      try {
         const [argumen] = args
         if (!args || !argumen) return client.reply(m.chat, Utils.example(isPrefix, command, 'tiktok'), m)
         const parser = Utils.arrayJoin(Object.values(Object.fromEntries(Object.entries(plugins).filter(([name, prop]) => prop.run.usage))))
         const commands = Utils.arrayJoin(parser.map(v => v.run.usage).concat(parser.map(v => v.run.hidden)))
         if (!commands.includes(argumen)) return client.reply(m.chat, Utils.texted('bold', `❌ Command ${isPrefix + argumen} does not exist.`), m)
         if (command == 'disable') {
            if (cmd.error.includes(argumen)) return client.reply(m.chat, Utils.texted('bold', `❌ ${isPrefix + argumen} command was previously disabled.`), m)
            cmd.error.push(argumen)
            client.reply(m.chat, Utils.texted('bold', `✅ Command ${isPrefix + argumen} disabled successfully.`), m)
         } else if (command == 'enable') {
            if (!cmd.error.includes(argumen)) return client.reply(m.chat, Utils.texted('bold', `❌ Command ${isPrefix + argumen} does not exist.`), m)
            cmd.error.forEach((data, index) => {
               if (data === argumen) cmd.error.splice(index, 1)
            })
            client.reply(m.chat, Utils.texted('bold', `✅ Command ${isPrefix + argumen} successfully activated.`), m)
         }

      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   owner: true
}