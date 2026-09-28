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
         const [limit] = args
         global.db.users.filter(v => v.limit < Config.limit && !v.premium).map(v => v.limit = limit || Config.limit)
         setting.lastReset = new Date * 1
         client.reply(m.chat, Utils.texted('bold', `✅ Successfully reset limit for user free to default.`), m)
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   owner: true
}
