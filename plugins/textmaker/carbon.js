exports.run = {
   usage: ['carbon'],
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
         if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'long hair'), m)
         client.sendReact(m.chat, '🕒', m.key)
         const json = await Func.fetchJson(`https://api.betabotz.eu.org/api/maker/carbon?text=${text}&apikey=beta-Ibrahim1209`)
         if (!json.status) return client.reply(m.chat, Func.jsonFormat(json), m)
         client.sendFile(m.chat, json.result, '', `◦  *Prompt* : ${text}`, m)
      } catch (e) {
         client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true,
   cache: true,
  premium: false,
  verified: true,
   location: __filename
}
