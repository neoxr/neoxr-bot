const { writeFileSync: create, readFileSync: read }= require('fs')
exports.run = {
   usage: ['backup'],
   category: 'owner',
   async: async (m, {
      client,
      command,
      env,
      Func
   }) => {
      try {
         create(env.database + '.json', JSON.stringify(global.db, null, 3), 'utf-8')
         await client.sendFile(m.chat, read('./' + env.database + '.json'), env.database + '.json', '', m)
      } catch (e) {
         return client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   owner: true,
   cache: true,
   location: __filename
}