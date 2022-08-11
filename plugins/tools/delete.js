exports.run = {
   usage: ['del', 'delete'],
   async: async (m, {
      client,
      isOwner
   }) => {
      if (!m.quoted) return
      client.sendMessage(m.chat, {
         delete: {
            remoteJid: m.chat,
            fromMe: false,
            id: m.quoted.id,
            participant: m.quoted.sender
         }
      })
   },
   error: false,
   group: true
}