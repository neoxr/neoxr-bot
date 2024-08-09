exports.run = {
   usage: ['blackpink', 'blood', 'breakwall', 'glow', 'joker', 'magma', 'matrix', 'multicolor', 'neon', 'papercut', 'slice', 'transformer', 'naruto'],
   use: 'text',
   category: 'text maker',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      Func
   }) => {
      try {
         if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'lucifer bot'), m)
         if (text.length > 10) return client.reply(m.chat, Func.texted('bold', `🚩 Text is too long max 10 characters.`), m)
         let old = new Date()
         await client.sendReact(m.chat, '🕒', m.key)
         const json = await Api.neoxr(`/${command.toLowerCase()}`, {
            text
         })
         if (!json.status) return client.reply(m.chat, global.status.fail, m)
         client.sendFile(m.chat, json.data.url, ``, `🍟 *Process* : ${((new Date - old) * 1)} ms`, m)
      } catch (e) {
         console.log(e)
         return client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true,
   verified: true,
   restrict: true
}
