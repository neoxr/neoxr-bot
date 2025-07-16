exports.run = {
   async: async (m, {
      client,
      groupSet,
      isAdmin,
      Func
   }) => {
      try {
         if (groupSet.antitagsw && !isAdmin && /groupStatusMentionMessage/.test(m.mtype)) return client.groupParticipantsUpdate(m.chat, [m.sender], 'remove').then(() => client.sendMessage(m.chat, {
            delete: {
               remoteJid: m.chat,
               fromMe: false,
               id: m.key.id,
               participant: m.sender
            }
         }))
      } catch (e) {
         return client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   group: true,
   botAdmin: true,
   exception: true,
   cache: true,
   location: __filename
}