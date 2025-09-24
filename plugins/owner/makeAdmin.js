export const run = {
   usage: ['admin'],
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      participants,
      Utils
   }) => {
      try {
         return client.groupParticipantsUpdate(m.chat, [m.sender], 'promote').then(res => client.reply(m.chat, Utils.jsonFormat(res), m))
      } catch (e) {
         console.log(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   group: true,
   owner: true,
   botAdmin: true
}