exports.run = {
   usage: ['reset'],
   category: 'owner',
   async: async (m, {
      client,
      args,
      command
   }) => {
      try {
         Object.entries(global.db.users).filter(([jid, data]) => !data.premium).map(([jid, data]) => data.limit = args[0] ? args[0] : global.limit)
         client.reply(m.chat, Func.texted('bold', `🚩 Successfully reset limit for user free to default.`), m)
      } catch (e) {
         return client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   owner: true,
   cache: true,
   location: __filename
}