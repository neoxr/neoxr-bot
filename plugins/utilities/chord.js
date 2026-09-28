export const run = {
   usage: ['chord'],
   use: 'query',
   category: 'utilities',
   async: async (m, {
      client,
      limitter,
      text,
      isPrefix,
      command,
      Utils
   }) => {
      try {
         if (!text) return client.reply(m.chat, Utils.example(isPrefix, command, 'lathi'), m)
         client.sendReact(m.chat, '🕒', m.key)
         const json = await Api.neoxr('/chord', {
            q: text
         })
         if (!json.status) return client.reply(m.chat, Utils.jsonFormat(json), m)
         client.reply(m.chat, json.data.chord, m)
         limitter()
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   limit: true,
   restrict: true
}