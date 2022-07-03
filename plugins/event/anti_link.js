exports.run = {
   async: async (m, {
      client,
      body,
      groupSet,
      isAdmin
   }) => {
      try {
         if (groupSet.antilink && !isAdmin && body && body.match(/(chat.whatsapp.com)/gi)) {
            if (body.includes(await client.groupInviteCode(m.chat))) return
            client.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
         }
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