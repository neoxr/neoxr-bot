exports.run = {
   async: async (m, {
      client,
      isAdmin,
      isOwner,
      Func
   }) => {
      try {
         if (!isOwner && !isAdmin && m.mentionedJid.length > 10) return client.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
      } catch (e) {
         return client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   group: true,
   botAdmin: true,
   cache: true,
   location: __filename
}