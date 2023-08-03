exports.run = {
   usage: ['checkapi'],
   category: 'miscs',
   async: async (m, {
      client,
      Func
   }) => {
      try {
         let json = await Api.neoxr('/check')
         await client.reply(m.chat, Func.jsonFormat(json), m)
      } catch (e) {
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   cache: true,
   location: __filename
}