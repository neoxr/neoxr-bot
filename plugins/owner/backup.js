import fsPromise from 'fs/promises'
import { models } from '../../lib/models.js'

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
         const data = await system.proxy.backup(models.structure, Config.database)
         const now = new Intl.DateTimeFormat('en-CA', { timeZone: process.env.TZ, hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date()).replace(', ', '_').replace(/:/g, '-')
         const filename = `${Config.database}-${now}.json`
         await fsPromise.writeFile(filename, data, 'utf-8')
         const buffer = await fsPromise.readFile(filename)
         await client.sendFile(m.chat, buffer, filename, '', m).then(async () => {
            await fsPromise.unlink(filename)
         })
      } catch (e) {
         return client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   owner: true
}