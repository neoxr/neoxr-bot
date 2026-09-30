export const run = {
   usage: ['prefix', '+prefix', '-prefix'],
   use: 'symbol',
   category: 'owner',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      setting,
      Utils,
      Config
   }) => {
      try {
         if (command == 'prefix') {
            if (!args || !args[0]) return client.reply(m.chat, Utils.example(isPrefix, command, '#'), m)
            // if (args[0].length > 1 && !Utils.getEmoji(args[0])) return client.reply(m.chat, Utils.texted('bold', `❌ Enter only 1 prefix.`), m)
            if (Config.evaluate_chars.includes(args[0])) return client.reply(m.chat, Utils.texted('bold', `❌ Tidak bisa menggunakan prefix ${args[0]} karena akan terjadi error.`), m)
            if (args[0] == setting.prefix) return client.reply(m.chat, Utils.texted('bold', `❌ Prefix ${args[0]} is currently used`), m)
            setting.onlyprefix = args[0]
            client.reply(m.chat, Utils.texted('bold', `✅ Prefix successfully changed to : ${args[0]}`), m)
         } else if (command == '+prefix') {
            if (!args || !args[0]) return client.reply(m.chat, Utils.example(isPrefix, command, '#'), m)
            // if (args[0].length > 1) return client.reply(m.chat, Utils.texted('bold', `❌ Enter only 1 prefix.`), m)
            if (Config.evaluate_chars.includes(args[0])) return client.reply(m.chat, Utils.texted('bold', `❌ Cannot add prefix ${args[0]} because an error will occur.`), m)
            if (setting.prefix.includes(args[0])) return client.reply(m.chat, Utils.texted('bold', `❌ Prefix ${args[0]} already exists in the database.`), m)
            setting.prefix.push(args[0])
            client.reply(m.chat, Utils.texted('bold', `✅ Prefix ${args[0]} successfully added.`), m)
         } else if (command == '-prefix') {
            if (!args || !args[0]) return client.reply(m.chat, Utils.example(isPrefix, command, '#'), m)
            // if (args[0].length > 1) return client.reply(m.chat, Utils.texted('bold', `❌ Enter only 1 prefix.`), m)
            if (setting.prefix.length < 2) return client.reply(m.chat, Utils.texted('bold', `❌ Can't removing more prefix.`), m)
            if (!setting.prefix.includes(args[0])) return client.reply(m.chat, Utils.texted('bold', `❌ Prefix ${args[0]} not exists in the database.`), m)
            setting.prefix.forEach((data, index) => {
               if (data === args[0]) setting.prefix.splice(index, 1)
            })
            client.reply(m.chat, Utils.texted('bold', `✅ Prefix ${args[0]} successfully removed.`), m)
         }
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   owner: true
}