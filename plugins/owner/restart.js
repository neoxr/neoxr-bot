const { MongoDB, PostgreSQL } = new(require('@neoxr/wb'))
const env = require('../../config.json')
if (process.env.DATABASE_URL && /mongo/.test(process.env.DATABASE_URL)) MongoDB.db = env.database
const machine = (process.env.DATABASE_URL && /mongo/.test(process.env.DATABASE_URL)) ? MongoDB : (process.env.DATABASE_URL && /postgres/.test(process.env.DATABASE_URL)) ? PostgreSQL : new(require('../../lib/system/localdb'))(env.database)
exports.run = {
   usage: ['restart'],
   category: 'owner',
   async: async (m, {
      client,
      Func
   }) => {
      await client.reply(m.chat, Func.texted('bold', 'Restarting . . .'), m).then(async () => {
         await machine.save()
         process.send('reset')
      })
   },
   owner: true
}