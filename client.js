require('./lib/system/config'), require('events').EventEmitter.defaultMaxListeners = 500
const { NeoxrCommands: Commands, Extra, Function: Func, MongoDB } = new(require('@neoxr/neoxr-js'))
const { Socket, Serialize, Scandir } = Extra
const pino = require('pino'),
   spinnies = new (require('spinnies'))(),
   qrcode = require('qrcode-terminal'),
   fs = require('fs'),
   important = fs.existsSync('./node_modules/bails') ? 'bails' : 'baileys'
const { DisconnectReason, useMultiFileAuthState, makeInMemoryStore, msgRetryCounterMap, delay } = require(important)
if (process.env.DATABASE_URL) MongoDB.db = global.database
const machine = process.env.DATABASE_URL ? MongoDB : new(require('./lib/system/localdb'))(global.database)
global.neoxr = Commands

const connect = async () => {
	global.store = makeInMemoryStore({
      logger: pino().child({
         level: 'silent',
         stream: 'store'
      })
   })
 
   const { state, saveCreds } = await useMultiFileAuthState('session')
   global.db = {users:[], chats:[], groups:[], sticker:{}, setting:{}, ...(await machine.fetch() ||{})}
   await machine.save(global.db) 
   global.client = Socket({
      logger: pino({
         level: 'silent'
      }),
      printQRInTerminal: true,
      patchMessageBeforeSending: (message) => {
         const requiresPatch = !!(
            message.buttonsMessage ||
            message.templateMessage ||
            message.listMessage
         );
         if (requiresPatch) {
            message = {
               viewOnceMessage: {
                  message: {
                     messageContextInfo: {
                        deviceListMetadataVersion: 2,
                        deviceListMetadata: {},
                     },
                     ...message,
                  },
               },
            }
         }
         return message
      },
      browser: ['@neoxr / neoxr-bot', 'safari', '1.0.0'],
      auth: state,
      getMessage: async (key) => {
         if (store) {
            const msg = await store.loadMessage(key.remoteJid, key.id)
            return msg.message || undefined
         }
         return {
            conversation: 'hello'
         }
      },
      // To see the latest version : https://web.whatsapp.com/check-update?version=1&platform=web
      version: [2, 2301, 6]
   })
   
   store.bind(client.ev)
   client.ev.on('connection.update', async (update) => {
      const {
         connection,
         lastDisconnect,
         qr
      } = update
      if (lastDisconnect == 'undefined' && qr != 'undefined') {
         qrcode.generate(qr, {
            small: true
         })
      }
      if (connection === 'connecting') {
       spinnies.add('start', {
         text: 'Connecting . . .'
      })
     } else if (connection === 'open') {
         spinnies.succeed('start', {
            text: `Connected, you login as ${client.user.name || client.user.verifiedName}`
         })
         await delay(1500)
         spinnies.add('start', {
            text: 'Load Plugins . . .'
         })
         const plugins = await Scandir('./plugins')
         plugins.filter(v => v.endsWith('.js')).map(file => require(file))
         await delay(1000)
         spinnies.succeed('start', {
            text: `${plugins.length} Plugins loaded`
         })
      } else if (connection === 'close') {
         if (lastDisconnect.error.output.statusCode == DisconnectReason.loggedOut) {
            spinnies.fail('start', {
               text: `Can't connect to Web Socket`
            })
            await machine.save()
            process.exit(0)
         } else {
            connect().catch(() => connect())
         }
      }
   })

   client.ev.on('creds.update', saveCreds)
   client.ev.on('messages.upsert', async chatUpdate => {
      try {
         m = chatUpdate.messages[0]
         if (!m.message) return
         Serialize(client, m)
         require('./lib/scraper'), require('./handler')(client, m)
      } catch (e) {
         console.log(e)
      }
   })
   
   client.ev.on('contacts.update', update => {
      for (let contact of update) {
         let id = client.decodeJid(contact.id)
         if (store && store.contacts) store.contacts[id] = {
            id,
            name: contact.notify
         }
      }
   })
   
   setInterval(async () => {
      if (global.db) await machine.save(global.db)
   }, 30_000)
   
   return client
}

connect().catch(() => connect())