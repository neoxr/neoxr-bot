exports.run = {
   usage: ['ohidetag'],
   hidden: ['o'],
   use: 'text',
   category: 'owner',
   async: async (m, {
      client,
      text,
      participants
   }) => {
      let users = participants.map(u => u.id)
      await client.reply(m.chat, text, null, {
         mentions: users
      })
   },
   owner: true,
   group: true
}