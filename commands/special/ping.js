exports.run = {
   usage: ['ping'],
   async: async (m, {
      client,
      text
   }) => {
      client.reply(m.chat, text || 'I\'m Alive . . .', m)
   },
   error: false,
   cache: true,
   location: __filename
}