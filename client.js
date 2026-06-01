import { Client, Config, Utils } from '@neoxr/wb'
import baileys from './lib/engine.js'
// import './lib/proto.js'
import './error.js'
import './lib/config.js'
import './lib/functions.js'
import bytes from 'bytes'
import fsPromise from 'fs/promises'
import colors from 'colors'
import cron from 'node-cron'
import extra from './lib/listeners-extra.js'
import { models, structure } from './lib/models.js'
import system from './lib/adapter.js'

const connect = async () => {
   try {
      const client = new Client({
         plugsdir: 'plugins',
         online: true,
         bypass_disappearing: true,
         bot: id => {
            // Detect message from bot by message ID, you can add another logic here
            return id && (id.startsWith('BAE') || /[-]/.test(id))
         },
         custom_id: 'neoxr', // Prefix for Custom Message ID (automatically detects isBot for itself)
         presence: true, // Set to 'true' if you want to see the bot typing or recording
         create_session: {
            type: system.session,
            session: 'session',
            config: process.env.DATABASE_URL || ''
         },
         engines: [baileys], // Init baileys as main engine
         debug: false // Set to 'true' if you want to see how this module works :v
      }, {
         // This is the Baileys connection options section
         version: Config.pairing.version, // To see the latest version : https://wppconnect.io/whatsapp-versions/
         browser: Config.pairing.browser,
         shouldIgnoreJid: jid => {
            return /(newsletter|bot)/.test(jid)
         }
      })

      client.once('connect', async res => {
         try {
            await system.proxy.init(models, structure, Config.database)

            const isEmpty = global.db.users.length === 0 && global.db.chats.length === 0

            if (isEmpty) {
               const previous = await system.database.fetch()

               if (previous && Object.keys(previous).length > 0) {
                  console.dim('[Proxy DB] Old data found, starting migration...')
                  await system.proxy.migrate(previous, structure)
                  console.dim('[Proxy DB] Migration successful!')
               }
            }
         } catch (e) {
            Utils.printError(e)
         }

         if (res && typeof res === 'object' && res.message) Utils.logFile(res.message)
      })

      client.register('error', async error => {
         console.log(colors.red(error.message))
         if (error && typeof error === 'object' && error.message) Utils.logFile(error.message)
      })

      client.once('ready', async () => {
         const ramCheck = setInterval(() => {
            var ramUsage = process.memoryUsage().rss
            if (ramUsage >= bytes(Config.ram_limit)) {
               clearInterval(ramCheck)
               process.send('reset')
            }
         }, 60 * 1000)

         cron.schedule('0 12 * * *', async () => {
            if (global?.db?.setting?.autobackup) {
               const data = await system.proxy.backup(structure, Config.database)
               const now = new Intl.DateTimeFormat('en-CA', { timeZone: process.env.TZ, hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date()).replace(', ', '_').replace(/:/g, '-')
               const filename = `${Config.database}-${now}.json`
               await fsPromise.writeFile(filename, data, 'utf-8')
               const buffer = await fsPromise.readFile(filename)
               await client.sock.sendFile(`${Config.owner}@s.whatsapp.net`, buffer, filename, '', null).then(async () => {
                  await fsPromise.unlink(filename)
               })
            }
         })

         extra(system, client)
      })
   } catch (e) {
      Utils.printError(e)
   }
}

connect().catch(() => connect())