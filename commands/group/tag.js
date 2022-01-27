exports.run = {
   usage: ['tag'],
   async: async (m, {
      client,
      text,
      participants,
      isPrefix,
      command
   }) => {
      let users = participants.map(u => u.id)
      if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'my love'), m)
      for (let i = 0; i < 1; i++) {
         var rand = Math.floor(users.length * Math.random())
         var tag = users[rand]
         client.reply(m.chat, `› *${text}* ~> @${tag.replace(/@.+/, '')}`)
      }
   },
   group: true
}