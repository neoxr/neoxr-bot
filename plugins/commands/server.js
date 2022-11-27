exports.run = {
   usage: ['server'],
   category: 'utilities',
   async: async (m, {
      client
   }) => {
      try {
         const json = await Func.fetchJson('http://ip-api.com/json')
         client.reply(m.chat, Func.jsonFormat(json), m)
      } catch {
         return client.reply(m.chat, global.status.error, m)
      }
   },
   error: false
}