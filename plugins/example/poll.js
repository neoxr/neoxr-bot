export const run = {
   usage: ['poll'],
   category: 'example',
   async: async (m, {
      client,
      Utils
   }) => {
      try {
         const votes = global.db.users.sort((a, b) => b.hit - a.hit).filter(v => v.name).map(v => ({
            name: client.getName(v.jid) || v.name,
            count: v.hit
         })).slice(0, 8)

         client.pollResult(m.chat, {
            name: 'Top Users',
            votes
         }, m)
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false
}