exports.run = {
   usage: ['del', 'delete'],
   async: async (m, {
      client
   }) => {
      if (!m.quoted) return
      let {
         chat,
         fromMe,
         id,
         isBot
      } = m.quoted
      if (!isBot) return
      client.sendMessage(m.chat, {
         delete: {
            remoteJid: m.chat,
            fromMe: true,
            id: m.quoted.id,
            participant: m.quoted.sender
         }
      })
   },
   error: false
}