exports.run = {
   usage: ['animediff'],
   use: 'prompt',
   category: 'generativeai',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      Func
   }) => {
      try {
         if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'cat under fire'), m)
         client.sendReact(m.chat, '🕒', m.key)
         const json = await Api.neoxr('/ai-anime', {
            q: text
         })
         if (!json.status) return client.reply(m.chat, Func.jsonFormat(json), m)
         client.sendFile(m.chat, json.data.url, '', `◦  *Prompt* : ${text}`, m)
      } catch (e) {
         client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true,
   premium: false,
   cache: true,
   verified: true,
   location: __filename
}
