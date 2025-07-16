exports.run = {
   async: async (m, {
      client,
      body,
      groupSet,
      isAdmin,
      Func
   }) => {
      try {
         const regex = /https?:\/\/(?:chat\.whatsapp\.com\/[A-Za-z0-9]+|whatsapp\.com\/channel\/[A-Za-z0-9]+|wa\.me\/\d+)/gi

         // delete link then kick when antilink is turned on
         if (groupSet.antilink && !isAdmin) {
            if ((body?.match(regex) || m?.msg?.name?.match(regex)) && !body?.includes(await client.groupInviteCode(m.chat))) return client.sendMessage(m.chat, {
               delete: {
                  remoteJid: m.chat,
                  fromMe: false,
                  id: m.key.id,
                  participant: m.sender
               }
            }).then(() => client.groupParticipantsUpdate(m.chat, [m.sender], 'remove'))
         }
         
         // it only removes the link when antilink turned off
         if (!groupSet.antilink && !isAdmin) {
            if ((body?.match(regex) || m?.msg?.name?.match(regex)) && !body?.includes(await client.groupInviteCode(m.chat))) return client.sendMessage(m.chat, {
               delete: {
                  remoteJid: m.chat,
                  fromMe: false,
                  id: m.key.id,
                  participant: m.sender
               }
            })
         }      
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