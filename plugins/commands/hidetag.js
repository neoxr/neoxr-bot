exports.run = {
   usage: ['hidetag'],
   hidden: ['o'],
   use: 'text',
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