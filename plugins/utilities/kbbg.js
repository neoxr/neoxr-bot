export const run = {
   usage: ['kbbg'],
   use: 'query',
   category: 'utilities',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      Utils
   }) => {
      try {
         if (!text) return client.reply(m.chat, Utils.example(isPrefix, command, 'sasimo'), m)
         client.sendReact(m.chat, '🕒', m.key)
         const json = await Api.neoxr('/kbbg', {
            q: text
         })
         if (!json.status) return client.reply(m.chat, Utils.jsonFormat(json), m)
         client.reply(m.chat, `*${json.data.word}*, ${json.data.description}`, m)
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true,
   restrict: true
}