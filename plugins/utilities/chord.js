exports.run = {
   usage: ['chord'],
   use: 'query',
   category: 'utilities',
   async: async (m, {
      client,
      text,
      isPrefix,
      command
   }) => {
      try {
         if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'sasimo'), m)
         client.sendReact(m.chat, '🕒', m.key)
         let json = await Api.chord(text)
         if (!json.status) return client.reply(m.chat, global.status.fail, m)
         client.reply(m.chat, json.data.chord, m)
      } catch {
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   restrict: true
}