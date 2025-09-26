import { Client, Config, Database, Utils } from '@neoxr/wb'
import baileys from './lib/engine.js'
import './error.js'
import './lib/config.js'
import './lib/functions.js'
import bytes from 'bytes'
import fs from 'node:fs'
import colors from 'colors'
import cron from 'node-cron'
import extra from './lib/listeners-extra.js'

const url = process?.env?.DATABASE_URL
const strategies = [
   { regex: /mongo/i, database: (url) => Database.saveToMongo(url, Config.database), session: 'mongo', name: 'Mongo' },
   { regex: /postgres/i, database: (url) => Database.saveToPostgres(url, Config.database), session: 'postgresql', name: 'PostgreSQL' },
   { regex: /mysql/i, database: (url) => Database.saveToMySQL(url, Config.database), session: 'mysql', name: 'MySQL' }
].find(({ regex }) => url && regex.test(url))
const system = {
   database: await (strategies
      ? strategies.database(url)
      : Database.saveToLocal(Config.database)),
   session: strategies?.session || 'local',
   name: strategies?.name || 'Local'
}

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
         version: [2, 3000, 1027023507], // To see the latest version : https://wppconnect.io/whatsapp-versions/
         browser: ['Ubuntu', 'Firefox', '20.0.00'],
         shouldIgnoreJid: jid => {
            return /(newsletter|bot)/.test(jid)
         }
      })

      client.register('connect', async ctx => {
         global.db = { users: [], chats: [], groups: [], statistic: {}, sticker: {}, setting: {}, ...(await system.database.fetch() || {}) }
         await system.database.save(global.db)
         if (ctx && typeof ctx === 'object' && ctx.message) Utils.logFile(ctx.message)
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

         if (!fs.existsSync('./temp')) fs.mkdirSync('./temp')

         setInterval(async () => {
            try {
               const tmpFiles = fs.readdirSync('./temp')
               if (tmpFiles.length > 0) {
                  tmpFiles.filter(v => !v.endsWith('.file')).map(v => fs.unlinkSync('./temp/' + v))
               }
            } catch { }
         }, 60 * 1000 * 10)

         setInterval(async () => {
            if (global.db) await system.database.save(global.db)
         }, 60 * 1000 * (['local', 'sqlite'].includes(system.session) ? 3 : 5))

         cron.schedule('0 12 * * *', async () => {
            if (global?.db?.setting?.autobackup) {
               await system.database.save(global.db)
               fs.writeFileSync(Config.database + '.json', JSON.stringify(global.db), 'utf-8')
               await client.sock.sendFile(Config.owner + '@s.whatsapp.net', fs.readFileSync('./' + Config.database + '.json'), Config.database + '.json', '', null)
            }
         })

         extra(system, client)
      })
   } catch (e) {
      Utils.printError(e)
   }
}

connect().catch(() => connect())