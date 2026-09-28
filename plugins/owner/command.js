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
      setting,
      Utils
   }) => {
      try {
         const [target] = args || []
         if (!target) return client.reply(m.chat, Utils.example(isPrefix, command, 'tiktok'), m)

         const targetCmd = target.toLowerCase()
         const allCommands = []

         for (const plugin of Object.values(plugins)) {
            if (!plugin?.run) continue
            if (plugin.run.usage) allCommands.push(...[plugin.run.usage].flat())
            if (plugin.run.hidden) allCommands.push(...[plugin.run.hidden].flat())
         }

         if (!allCommands.includes(targetCmd)) {
            return client.reply(m.chat, Utils.texted('bold', `❌ Command ${isPrefix + targetCmd} does not exist.`), m)
         }

         setting.error = setting.error || []

         if (command === 'disable') {
            if (setting.error.includes(targetCmd)) {
               return client.reply(m.chat, Utils.texted('bold', `❌ Command ${isPrefix + targetCmd} was previously disabled.`), m)
            }
            setting.error.push(targetCmd)
            return client.reply(m.chat, Utils.texted('bold', `✅ Command ${isPrefix + targetCmd} disabled successfully.`), m)
         }

         if (command === 'enable') {
            if (!setting.error.includes(targetCmd)) {
               return client.reply(m.chat, Utils.texted('bold', `❌ Command ${isPrefix + targetCmd} was not disabled.`), m)
            }
            setting.error = setting.error.filter(v => v !== targetCmd)
            return client.reply(m.chat, Utils.texted('bold', `✅ Command ${isPrefix + targetCmd} successfully activated.`), m)
         }
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   owner: true
}
