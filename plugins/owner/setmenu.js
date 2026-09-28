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
      const [argumen] = args
      try {
         if (!args || !argumen) return m.reply(Utils.example(isPrefix, command, '2'))
         if (!['1','2','3','4','5', '6'].includes(argumen)) return client.reply(m.chat, Utils.texted('bold', `❌ Style not available.`), m)
         client.reply(m.chat, `✅ Bot menu successfully set using style *${argumen}*.`, m).then(() => setting.style = parseInt(argumen))
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   owner: true
}