export const run = {
   usage: ['gemini'],
   use: 'prompt',
   category: 'ai',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      Utils
   }) => {
      try {
         if (!text) return client.reply(m.chat, Utils.example(isPrefix, command, 'apa itu kucing'), m)

         const json = await Api.neoxr('/gemini-chat', {
            q: text
         })

         if (!json.status) return client.reply(m.chat, json.msg, m)
         client.reply(m.chat, json.data.message, m)
      } catch (e) {
         console.error(e)
         return client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   limit: true
}