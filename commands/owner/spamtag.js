exports.run = {
   usage: ['spam', 'spamtag'],
   async: async (m, {
      client,
      text,
      participants
   }) => {
      let [amount, ...teks] = text.split`|`
      teks = (teks || []).join`|`
      if (isNaN(amount)) return client.reply(m.chat, Func.texted('bold', `Amount must be a number`), m)
      for (let i = 0; i < (amount ? amount : 10); i++) {
         let users = participants.map(u => u.id)
         await client.reply(m.chat, teks || '.', null, {
            contextInfo: {
               mentionedJid: users
            }
         })
         await Func.delay(1500)
      }
   },
   owner: true,
   group: true
}