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
         if (!text || (!m.quoted && !m.quoted.text)) return client.reply(m.chat, Func.example(isPrefix, command, 'How are you?'), m)
         let vocal = command.charAt(1)
         let t = m.quoted ? m.quoted.text : text
         client.reply(m.chat, t.toLowerCase().replace(/[aiueo]/gi, vocal), m)
      } catch {
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   group: true
}