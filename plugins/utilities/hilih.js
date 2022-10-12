exports.run = {
   usage: ['halah', 'hilih', 'huluh', 'heleh', 'holoh'],
   use: 'text or reply chat',
   category: 'utilities',
   async: async (m, {
      client,
      text,
      isPrefix,
      command
   }) => {
      try {
         let vocal = command.charAt(1)
         let t = m.quoted ? m.quoted.text : text
         if (!t) return client.reply(m.chat, Func.example(isPrefix, command, 'How are you?'), m)
         client.reply(m.chat, t.toLowerCase().replace(/[aiueo]/gi, vocal), m)
      } catch (e) {
         client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false
}