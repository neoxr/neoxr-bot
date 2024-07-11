const { MongoDB, PostgreSQL } = new(require('@neoxr/wb'))
const { readFileSync: read }= require('fs')
const env = require('config.json')
exports.run = {
   usage: ['restore'],
   category: 'owner',
   async: async (m, {
      client,
      command,
      env,
      Func
   }) => {
      try {
         if (process.env.DATABASE_URL && /mongo/.test(process.env.DATABASE_URL)) MongoDB.db = env.database
         const machine = (process.env.DATABASE_URL && /mongo/.test(process.env.DATABASE_URL)) ? MongoDB : (process.env.DATABASE_URL && /postgres/.test(process.env.DATABASE_URL)) ? PostgreSQL : new(require('lib/system/localdb'))(env.database)
         if (m.quoted && /document/.test(m.quoted.mtype) && m.quoted.mimetype === 'application/json') {
            const fn = await Func.getFile(await m.quoted.download())
            if (!fn.status) return m.reply(Func.texted('bold', '🚩 File cannot be downloaded.'))
            global.db = JSON.parse(read(fn.file, 'utf-8'))
            m.reply('✅ Database was successfully restored.').then(async () => {
               await machine.save(JSON.parse(read(fn.file, 'utf-8')))
            })
         } else m.reply(Func.texted('bold', '🚩 Reply to the backup file first then reply with this feature.'))
      } catch (e) {
         return client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   owner: true,
   cache: true,
   location: __filename
}