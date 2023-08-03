exports.run = {
   usage: ['setdesc', 'setname'],
   use: 'text',
   category: 'admin tools',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      Func
   }) => {
      let value = m.quoted ? m.quoted.text : text
      if (command == 'setname') {
         if (!value) return client.reply(m.chat, Func.example(isPrefix, command, 'CHATBOT'), m)
         if (value > 25) return client.reply(m.chat, Func.texted('bold', `🚩 Text is too long, maximum 25 character.`), m)
         await client.groupUpdateSubject(m.chat, value)
      } else if (command == 'setdesc') {
     	if (!value) return client.reply(m.chat, Func.example(isPrefix, command, `Follow the rules if you don't want to be kicked.`), m)
         await client.groupUpdateDescription(m.chat, value)
      }
   },
   group: true,
   admin: true,
   botAdmin: true
}