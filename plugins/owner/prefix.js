export const run = {
   usage: ['prefix', '+prefix', '-prefix'],
   use: 'symbol',
   category: 'owner',
   async: async (m, {
      client,
      setting,
      args,
      isPrefix,
      command,
      Utils,
      Config
   }) => {
      try {
         const [argumen] = args
         let system = setting
         if (command == 'prefix') {
            if (!args || !argumen) return client.reply(m.chat, Utils.example(isPrefix, command, '#'), m)
            // if (argumen.length > 1 && !Utils.getEmoji(argumen)) return client.reply(m.chat, Utils.texted('bold', `❌ Enter only 1 prefix.`), m)
            if (Config.evaluate_chars.includes(argumen)) return client.reply(m.chat, Utils.texted('bold', `❌ Tidak bisa menggunakan prefix ${argumen} karena akan terjadi error.`), m)
            if (argumen == system.prefix) return client.reply(m.chat, Utils.texted('bold', `❌ Prefix ${argumen} is currently used`), m)
            system.onlyprefix = argumen
            client.reply(m.chat, Utils.texted('bold', `✅ Prefix successfully changed to : ${argumen}`), m)
         } else if (command == '+prefix') {
            if (!args || !argumen) return client.reply(m.chat, Utils.example(isPrefix, command, '#'), m)
            // if (argumen.length > 1) return client.reply(m.chat, Utils.texted('bold', `❌ Enter only 1 prefix.`), m)
            if (Config.evaluate_chars.includes(argumen)) return client.reply(m.chat, Utils.texted('bold', `❌ Cannot add prefix ${argumen} because an error will occur.`), m)
            if (system.prefix.includes(argumen)) return client.reply(m.chat, Utils.texted('bold', `❌ Prefix ${argumen} already exists in the database.`), m)
            system.prefix.push(argumen)
            client.reply(m.chat, Utils.texted('bold', `✅ Prefix ${argumen} successfully added.`), m)
         } else if (command == '-prefix') {
            if (!args || !argumen) return client.reply(m.chat, Utils.example(isPrefix, command, '#'), m)
            // if (argumen.length > 1) return client.reply(m.chat, Utils.texted('bold', `❌ Enter only 1 prefix.`), m)
            if (system.prefix.length < 2) return client.reply(m.chat, Utils.texted('bold', `❌ Can't removing more prefix.`), m)
            if (!system.prefix.includes(argumen)) return client.reply(m.chat, Utils.texted('bold', `❌ Prefix ${argumen} not exists in the database.`), m)
            system.prefix.forEach((data, index) => {
               if (data === argumen) system.prefix.splice(index, 1)
            })
            client.reply(m.chat, Utils.texted('bold', `✅ Prefix ${argumen} successfully removed.`), m)
         }

      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   owner: true
}