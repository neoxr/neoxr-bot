export const run = {
   async: async (m, {
      client,
      body,
      groupSet,
      Utils
   }) => {
      try {
         if (!m.fromMe && body && (groupSet.antivirtex && body.match(/(৭৭৭৭৭৭৭৭|๒๒๒๒๒๒๒๒|๑๑๑๑๑๑๑๑|ดุท้่เึางืผิดุท้่เึางื)/gi) || groupSet.antivirtex && body.length > 10000)) return client.message.send(m.chat, {
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
