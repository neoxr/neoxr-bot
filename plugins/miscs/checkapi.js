export const run = {
   usage: ['checkapi'],
   category: 'miscs',
   async: async (m, {
      client,
      Utils
   }) => {
      try {
         let json = await Api.neoxr('/check')
         await client.reply(m.chat, Utils.jsonFormat(json), m)
      } catch (e) {
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false
}