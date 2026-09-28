export const run = {
   usage: ['pollresult'],
   category: 'example',
   async: async (m, {
      client,
      Utils
   }) => {
      try {
         const votes = global.db.users.sort((a, b) => b.hit - a.hit).filter(v => v.name).map(v => ({
            name: client.getName(v.jid) || v.name,
            count: v.hit
         }))

         client.pollResult(m.chat, {
            name: 'Top Users',
            votes
         }, m, { exclusive: true })
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false
}