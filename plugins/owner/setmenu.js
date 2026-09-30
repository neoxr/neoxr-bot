export const run = {
   usage: ['setmenu'],
   use: '(option)',
   category: 'owner',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      setting,
      Utils
   }) => {
      try {
         if (!args || !args[0]) return m.reply(Utils.example(isPrefix, command, '2'))
         if (!['1','2','3','4'].includes(args[0])) return client.reply(m.chat, Utils.texted('bold', `❌ Style not available.`), m)
         client.reply(m.chat, `✅ Bot menu successfully set using style *${args[0]}*.`, m).then(() => setting.style = parseInt(args[0]))
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   owner: true
}