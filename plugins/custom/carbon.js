exports.run = {
   usage: ['carbon'],
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
         if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'long hair girl'), m)
         await client.sendReact(m.chat, '🕒', m.key)
         let json = await Func.fetchJson(`https://aemt.me/carbon?text=${encodeURIComponent(text)}`)
         let result = json.result
         client.sendFile(m.chat, result, 'image.png', '', m)
      } catch (e) {
         client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true,
   cache: true,
   location: __filename
 }