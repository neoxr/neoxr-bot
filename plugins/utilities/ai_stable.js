exports.run = {
   usage: ['stablediff'],
   use: 'prompt',
   category: 'utilities',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      Func
   }) => {
      try {
         if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'black cat'), m)
         client.sendReact(m.chat, '🕒', m.key)
         const json = await Api.neoxr('/diffusion', {
            q: text
         })
         if (!json.status) return client.reply(m.chat, Func.jsonFormat(json), m)
         const src = Func.random(json.data)
         client.sendFile(m.chat, src.url, '', '', m)
      } catch (e) {
         client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true,
   cache: true,
   location: __filename
}