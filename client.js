import { Client, Config, Utils } from '@neoxr/zapo'
import bytes from 'bytes'
import fsPromise from 'fs/promises'
import colors from 'colors'
import cron from 'node-cron'
import system from './lib/adapter.js'
import { models } from './lib/models.js'
import schema from './lib/schema.js'
import './lib/config.js'
import './lib/functions.js'
import './error.js'
import ZapoJS from './lib/zapo.js'
import pm2 from './lib/pm2.js'
import extra from './lib/listeners-extra.js'

import stores from '@neoxr/store'
const store = stores.default || stores

store.config({
   max: Number(process.env.MAX_STORE || 100),
   debug: Config.debuging
})

const connect = async () => {
   await system.proxy.init(models, models.structure, Config.database)

   const client = new Client({
      plugsdir: './plugins',
      presence: true,
      custom_id: 'neoxr',
      pairing: Config.pairing,
      engines: [store],
      debug: Config.debuging
   })

   client.on('error', async error => {
      const errorRegex = /Device logged out|Multi device mismatch|Method not allowed|Bad session file|Session opened on another server|403|516/i

      if (errorRegex.test(error.message)) {
         try {
            pm2().catch(console.error)
         } catch (e) {
            Utils.printError(e)
         }
      }

      console.error(colors.red(error.message))
   })

   client.once('ready', async ctx => {
      const ramCheck = setInterval(() => {
         var ramUsage = process.memoryUsage().rss
         if (ramUsage >= bytes(Config.ram_limit)) {
            clearInterval(ramCheck)
            process.send('reset')
         }
      }, 60 * 1000)

      cron.schedule('0 12 * * *', async () => {
         if (global?.db?.setting?.autobackup) {
            const data = await system.proxy.backup(models.structure, Config.database)
            const now = new Intl.DateTimeFormat('en-CA', { timeZone: process.env.TZ, hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date()).replace(', ', '_').replace(/:/g, '-')
            const filename = `${Config.database}-${now}.json`
            await fsPromise.writeFile(filename, data, 'utf-8')
            const buffer = await fsPromise.readFile(filename)
            await client.sock.sendFile(`${Config.owner}@s.whatsapp.net`, buffer, filename, '', null).then(async () => {
               await fsPromise.unlink(filename)
            })
         }
      })

      ZapoJS.bind(client.sock)
   })

   extra(system, client)
}

connect().catch(() => console.error('Failed to connect to WhatsApp. Please check your configuration and try again.'))