exports.run = {
   usage: ['textmaker'],
   hidden: ['blackpink', 'blood', 'breakwall', 'glow', 'joker', 'magma', 'matrix', 'multicolor', 'neon', 'papercut', 'slice'],
   use: 'text',
   category: 'utilities',
   async: async (m, {
      client,
      text,
      isPrefix,
      command
   }) => {
      try {
         if (command == 'textmaker') {
            if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'neoxr bot'), m)
            if (text.length > 10) return client.reply(m.chat, Func.texted('bold', `🚩 Text is too long max 10 characters.`), m)
            client.sendReact(m.chat, '🕒', m.key)
            const style = ['blackpink', 'blood', 'breakwall', 'glow', 'joker', 'magma', 'matrix', 'multicolor', 'neon', 'papercut', 'slice']
            let rows = []
            style.map(v => rows.push({
               title: v.toUpperCase(),
               rowId: `${isPrefix + v} ${text}`,
               description: ``
            }))
            client.sendList(m.chat, '', `Choose style you want 🍟`, '', 'Tap!', [{
               rows
            }], m)
         } else {
            if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'neoxr bot'), m)
            if (text.length > 10) return client.reply(m.chat, Func.texted('bold', `🚩 Text is too long max 10 characters.`), m)
            let old = new Date()
            await client.sendReact(m.chat, '🕒', m.key)
            let result = Api.tm(command.toLowerCase(), text)
            if (!result || result.constructor.name != 'String') return client.reply(m.chat, global.status.fail, m)
            client.sendFile(m.chat, result, ``, `🍟 *Process* : ${((new Date - old) * 1)} ms`, m)
         }
      } catch (e) {
         console.log(e)
         return client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   limit: true
}