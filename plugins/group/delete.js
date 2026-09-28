export const run = {
   usage: ['delete'],
   hidden: ['del'],
   use: 'reply chat',
   category: 'group',
   async: async (m, {
      client,
      isBotAdmin
   }) => {
      try {
         if (!m.quoted) return
         client.sendMessage(m.chat, {
            delete: {
               remoteJid: m.chat,
               fromMe: isBotAdmin ? false : true,
               id: m.quoted.id,
               participant: m.quoted.sender
            }
         })

      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   group: true
}