exports.run = {
   usage: ['blackpink', 'blood', 'breakwall', 'glow', 'joker', 'magma', 'matrix', 'multicolor', 'neon', 'papercut', 'slice'],
   use: 'text',
   category: 'text maker',
   async: async (m, {
      client,
      text,
      isPrefix,
      command
   }) => {
      try {
         if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'neoxr bot'), m)
         if (text.length > 10) return client.reply(m.chat, Func.texted('bold', `🚩 Text is too long max 10 characters.`), m)
         client.sendReact(m.chat, '🕒', m.key)
         let old = new Date()
         let result = Api.tm(command.toLowerCase(), text)
         if (!result || result.constructor.name != 'String') return client.reply(m.chat, global.status.fail, m)
         client.sendFile(m.chat, result, ``, `🍟 *Process* : ${((new Date - old) * 1)} ms`, m)
      } catch (e) {
         console.log(e)
         return client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   limit: true
}