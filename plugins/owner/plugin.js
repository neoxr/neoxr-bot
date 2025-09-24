export const run = {
   usage: ['plugen', 'plugdis'],
   use: 'plugin name',
   category: 'owner',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      plugins: plugs,
      Utils
   }) => {
      let pluginDisable = global.db.setting.pluginDisable
      if (!args || !args[0]) return client.reply(m.chat, Utils.example(isPrefix, command, 'tiktok'), m)
      if (command == 'plugdis') {
         let plugins = Object.keys(plugs)
         if (!plugins.includes(args[0])) return client.reply(m.chat, Utils.texted('bold', `🚩 Plugin ${args[0]}.js not found.`), m)
         if (pluginDisable.includes(args[0])) return client.reply(m.chat, Utils.texted('bold', `🚩 Plugin ${args[0]}.js previously has been disabled.`), m)
         pluginDisable.push(args[0])
         client.reply(m.chat, Utils.texted('bold', `🚩 Plugin ${args[0]}.js successfully disabled.`), m)
      } else if (command == 'plugen') {
         if (!pluginDisable.includes(args[0])) return client.reply(m.chat, Utils.texted('bold', `🚩 Plugin ${args[0]}.js not found.`), m)
         pluginDisable.forEach((data, index) => {
            if (data === args[0]) pluginDisable.splice(index, 1)
         })
         client.reply(m.chat, Utils.texted('bold', `🚩 Plugin ${args[0]}.js successfully enable.`), m)
      }
   },
   owner: true
}