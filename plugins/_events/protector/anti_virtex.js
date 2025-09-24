export const run = {
   async: async (m, {
      client,
      body,
      groupSet,
      Utils
   }) => {
      try {
         if (!m.fromMe && body && (groupSet.antivirtex && body.match(/(৭৭৭৭৭৭৭৭|๒๒๒๒๒๒๒๒|๑๑๑๑๑๑๑๑|ดุท้่เึางืผิดุท้่เึางื)/gi) || groupSet.antivirtex && body.length > 10000)) return client.sendMessage(m.chat, {
            delete: {
               remoteJid: m.chat,
               fromMe: false,
               id: m.key.id,
               participant: m.sender
            }
         }).then(() => client.groupParticipantsUpdate(m.chat, [m.sender], 'remove'))
      } catch (e) {
         return client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   group: true,
   botAdmin: true,
   exception: true
}