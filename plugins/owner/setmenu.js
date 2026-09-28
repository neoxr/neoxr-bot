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
         const [opt] = args || []
         if (!opt) return client.reply(m.chat, Utils.example(isPrefix, command, '3'), m)
         if (!['1', '2', '3'].includes(opt)) return client.reply(m.chat, Utils.texted('bold', '❌ Style not available. Available styles: 3, 4, 5.'), m)

         setting.style = parseInt(opt)
         client.reply(m.chat, Utils.texted('bold', `✅ Bot menu successfully set using style ${opt}.`), m)
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   owner: true
}
