import fs from 'node:fs'

export const run = {
   usage: ['backup'],
   category: 'owner',
   async: async (m, {
      client,
      Config,
      system,
      Utils
   }) => {
      try {
         await client.sendReact(m.chat, '🕒', m.key)
         await system.database.save(global.db)
         fs.writeFileSync(Config.database + '.json', JSON.stringify(global.db), 'utf-8')
         await client.sendFile(m.chat, fs.readFileSync('./' + Config.database + '.json'), Config.database + '.json', '', m)
      } catch (e) {
         return client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   owner: true
}