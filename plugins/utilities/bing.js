export const run = {
   usage: ['bing'],
   use: 'prompt',
   category: 'utilities',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      Utils,
      limitter
   }) => {
      try {
         if (command === 'bing') {
            if (!text) return client.reply(m.chat, Utils.example(isPrefix, command, 'apa itu kucing'), m)
            client.sendReact(m.chat, '🕒', m.key)
            const json = await Api.neoxr('/bing-chat', {
               q: text
            })
            if (!json.status) return client.reply(m.chat, Utils.jsonFormat(json), m)
            client.reply(m.chat, json.data.message, m)
         }
         limitter()
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   limit: true
}