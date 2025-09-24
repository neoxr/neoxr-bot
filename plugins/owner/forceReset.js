export const run = {
   usage: ['reset'],
   category: 'owner',
   async: async (m, {
      client,
      args,
      command,
      setting,
      Config,
      Utils
   }) => {
      try {
         global.db.users.filter(v => v.limit < Config.limit && !v.premium).map(v => v.limit = args[0] ? args[0] : Config.limit)
         setting.lastReset = new Date * 1
         client.reply(m.chat, Utils.texted('bold', `🚩 Successfully reset limit for user free to default.`), m)
      } catch (e) {
         return client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   owner: true
}