export const run = {
   usage: ['ai'],
   use: 'prompt',
   category: 'utilities',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      Utils
   }) => {
      try {
         if (!text) return client.reply(m.chat, Utils.example(isPrefix, command, 'hi'), m)
         client.sendReact(m.chat, '🕒', m.key)
         const json = await Api.neoxr('/gpt-pro', {
            q: text
         })
         if (!json.status) return client.reply(m.chat, Utils.jsonFormat(json), m)
         client.reply(m.chat, json.data.message, m)
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true
}