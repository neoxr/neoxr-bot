const fs = require('fs')

exports.run = {
   usage: ['backup'],
   category: 'owner',
   async: async (m, {
      client,
      env,
      database,
      Func
   }) => {
      try {
         await client.sendReact(m.chat, '🕒', m.key)
         await database.save(global.db)
         fs.writeFileSync(env.database + '.json', JSON.stringify(global.db), 'utf-8')
         await client.sendFile(m.chat, fs.readFileSync('./' + env.database + '.json'), env.database + '.json', '', m)
      } catch (e) {
         return client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   owner: true,
   cache: true,
   location: __filename
}