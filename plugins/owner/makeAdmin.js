exports.run = {
   usage: ['admin'],
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      participants,
      Func
   }) => {
      try {
         return client.groupParticipantsUpdate(m.chat, [m.sender], 'promote').then(res => client.reply(m.chat, Func.jsonFormat(res), m))
      } catch (e) {
         console.log(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   group: true,
   owner: true,
   botAdmin: true
}