export const run = {
   usage: ['ohidetag'],
   hidden: ['o'],
   use: 'text',
   category: 'owner',
   async: async (m, {
      client,
      text,
      participants
   }) => {
      try {
         const mentions = participants.map(u => u.id)
         await client.reply(m.chat, text, null, {
            mentions
         })
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   owner: true,
   group: true
}