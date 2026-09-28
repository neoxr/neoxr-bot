export const run = {
   usage: ['+toxic', '-toxic'],
   use: 'word',
   category: 'owner',
   async: async (m, {
      client,
      setting,
      args,
      isPrefix,
      command,
      Utils
   }) => {
      const [argumen] = args
      try {
         if (command == '+toxic') {
            if (!args || !argumen) return client.reply(m.chat, Utils.example(isPrefix, command, 'fuck'), m)
            if (setting.toxic.includes(argumen)) return client.reply(m.chat, Utils.texted('bold', `❌ '${argumen}' already in the database.`), m)
            setting.toxic.push(argumen)
            setting.toxic.sort(function(a, b) {
               if (a < b) {
                  return -1;
               }
               if (a > b) {
                  return 1;
               }
               return 0
            })
            client.reply(m.chat, Utils.texted('bold', `✅ '${argumen}' added successfully!`), m)
         } else if (command == '-toxic') {
            if (!args || !argumen) return client.reply(m.chat, Utils.example(isPrefix, command, 'fuck'), m)
            if (setting.toxic.length < 2) return client.reply(m.chat, Utils.texted('bold', `❌ Sorry, you can't remove more.`), m)
            if (!setting.toxic.includes(argumen)) return client.reply(m.chat, Utils.texted('bold', `❌ '${argumen}' not in database.`), m)
            setting.toxic.forEach((data, index) => {
               if (data === argumen) setting.toxic.splice(index, 1)
            })
            client.reply(m.chat, Utils.texted('bold', `✅ '${argumen}' has been removed.`), m)
         }
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   owner: true
}