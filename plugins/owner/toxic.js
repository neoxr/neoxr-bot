export const run = {
   usage: ['+toxic', '-toxic'],
   use: 'word',
   category: 'owner',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      Utils,
      setting
   }) => {
      try {
         const [word] = args
         if (command == '+toxic') {
            if (!word) return client.reply(m.chat, Utils.example(isPrefix, command, 'fuck'), m)
            if (setting.toxic.includes(word)) return client.reply(m.chat, Utils.texted('bold', `❌ '${word}' already in the database.`), m)
            setting.toxic.push(word)
            setting.toxic.sort(function(a, b) {
               if (a < b) {
                  return -1;
               }
               if (a > b) {
                  return 1;
               }
               return 0
            })
            client.reply(m.chat, Utils.texted('bold', `✅ '${word}' added successfully!`), m)
         } else if (command == '-toxic') {
            if (!word) return client.reply(m.chat, Utils.example(isPrefix, command, 'fuck'), m)
            if (setting.toxic.length < 2) return client.reply(m.chat, Utils.texted('bold', `❌ Sorry, you can't remove more.`), m)
            if (!setting.toxic.includes(word)) return client.reply(m.chat, Utils.texted('bold', `❌ '${word}' not in database.`), m)
            setting.toxic.forEach((data, index) => {
               if (data === word) setting.toxic.splice(index, 1)
            })
            client.reply(m.chat, Utils.texted('bold', `✅ '${word}' has been removed.`), m)
         }
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   owner: true
}
