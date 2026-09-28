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

         client.message.send(m.chat, {
            type: 'revoke',
            target: {
               remoteJid: m.chat,
               id: m.quoted.id,
               fromMe: isBotAdmin ? false : true,
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
