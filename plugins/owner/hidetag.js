neoxr.create(async (m, {
   client,
   text,
   participants,
   Func
}) => {
   let users = participants.map(u => u.id)
   await client.reply(m.chat, text, null, {
      mentions: users
   })
}, {
   usage: ['hidetag'],
   hidden: ['o'],
   use: 'text',
   category: 'owner',
   owner: true,
   group: true
}, __filename)