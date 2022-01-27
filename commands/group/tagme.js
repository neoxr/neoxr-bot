exports.run = {
   usage: ['tagme'],
   async: async (m, {
      client
   }) => {
      client.reply(m.chat, `@${sender.split`@`[0]}`, m)
   },
   group: true
}