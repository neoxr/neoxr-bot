exports.run = {
   usage: ['wame'],
   async: async (m, {
      client,
      text
   }) => {
      let number = m.quoted ? (m.quoted.sender).split`@` [0] : (m.sender).split`@` [0]
      let chat = text ? text : 'Hai kak'
      await client.reply(m.chat, `https://wa.me/${number}?text=${chat.replace(/\s/gi, '+')}`, m)
   },
   error: false
}