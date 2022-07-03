const fs = require('fs')
exports.run = {
   usage: ['backup', 'save'],
   async: async (m, {
      client,
      command
   }) => {
      try {
         await sql.save()
         let create = fs.writeFileSync('./database.json', JSON.stringify(global.db, null, 3), 'utf-8')
         let file = await Func.fetchBuffer('./database.json')
         client.reply(m.chat, global.status.wait, m)
         await client.sendDocument(m.chat, file, 'database.json', m)
      } catch {
         return client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   owner: true,
   cache: true,
   location: __filename
}