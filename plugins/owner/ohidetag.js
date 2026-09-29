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
      let users = participants.map(u => u.id)
      await client.reply(m.chat, text, null, {
         mentions: users
      })
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   owner: true,
   group: true
}