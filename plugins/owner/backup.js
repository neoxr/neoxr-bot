const { writeFileSync: create, readFileSync: read }= require('fs')
exports.run = {
   usage: ['backup'],
   category: 'owner',
   async: async (m, {
      client,
      command
   }) => {
      try {
         await props.save()
         create('./database.json', JSON.stringify(global.db, null, 3), 'utf-8')
         client.reply(m.chat, global.status.wait, m)
         await client.sendFile(m.chat, read('./database.json'), 'database.json', '', m)
      } catch (e) {
         return client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   owner: true,
   cache: true,
   location: __filename
}