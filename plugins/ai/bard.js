export const run = {
   usage: ['bard'],
   use: 'prompt',
   category: 'ai',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      Utils,
      limitter
   }) => {
      try {
         if (!text) return client.reply(m.chat, Utils.example(isPrefix, command, 'apa itu kucing'), m)
         client.sendReact(m.chat, '🕒', m.key)
         const json = await Api.neoxr('/bard', {
            q: text
         })
         if (!json.status) return client.reply(m.chat, Utils.jsonFormat(json), m)
         client.reply(m.chat, json.data.message, m)
         limitter()
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   limit: true
}