export const run = {
   async: async (m, {
      client,
      groupSet,
      isAdmin,
      Utils
   }) => {
      try {
         if (groupSet.antitagsw && !isAdmin && /groupStatus/.test(m.mtype)) return client.message.send(m.chat, {
            type: 'revoke',
            target: {
               remoteJid: m.chat,
               id: m.id,
               fromMe: false,
               participant: m.sender
            }
         }).then(() => client.groupParticipantsUpdate(m.chat, [m.sender], 'remove'))
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   group: true,
   botAdmin: true
}
