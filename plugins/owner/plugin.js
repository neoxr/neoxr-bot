import path from 'path'

export const run = {
   usage: ['plugen', 'plugdis'],
   use: 'plugin name',
   category: 'owner',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      ctx,
      setting,
      Utils
   }) => {
      try {
         const [pluginName] = args || []
         if (!pluginName) return client.reply(m.chat, Utils.example(isPrefix, command, 'tiktok'), m)

         setting.pluginDisable = setting.pluginDisable || []
         const plugins = Object.keys(ctx.plugins || {}).map(dir => path.basename(dir, '.js'))
         const regex = new RegExp(pluginName, 'i')

         if (command === 'plugdis') {
            const matched = plugins.filter(p => regex.test(p))
            if (!matched.length) return client.reply(m.chat, Utils.texted('bold', `❌ Plugin ${pluginName}.js not found.`), m)

            let disabledCount = 0
            for (const name of matched) {
               if (!setting.pluginDisable.includes(name)) {
                  setting.pluginDisable.push(name)
                  disabledCount++
               }
            }

            if (disabledCount === 0) return client.reply(m.chat, Utils.texted('bold', '❌ All matched plugins are already disabled.'), m)

            return client.reply(m.chat, Utils.texted('bold', `✅ ${disabledCount} plugin(s) successfully disabled.`), m)
         }

         if (command === 'plugen') {
            const before = setting.pluginDisable.length
            setting.pluginDisable = setting.pluginDisable.filter(p => !regex.test(p))
            const enabledCount = before - setting.pluginDisable.length

            if (enabledCount === 0) return client.reply(m.chat, Utils.texted('bold', '❌ No matching plugin found in disabled list.'), m)

            return client.reply(m.chat, Utils.texted('bold', `✅ ${enabledCount} plugin(s) successfully enabled.`), m)
         }
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   owner: true
}
