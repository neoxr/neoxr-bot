process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'
require('dotenv').config()
const { useSingleFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeInMemoryStore } = require('@adiwajshing/baileys')
const session = process.argv[2] ? process.argv[2] + '.json' : 'session.json'
const { state } = useSingleFileAuthState(session)
const pino = require('pino'), path = require('path'), fs = require('fs'), colors = require('@colors/colors/safe'), qrcode = require('qrcode-terminal')
const spinnies = new (require('spinnies'))()
const { Socket, Serialize, Scandir } = require('./system/extra')
global.neoxr = new (require('./system/map'))
global.Func = new (require('./system/function'))
global.scrap = new (require('./system/scraper'))
global.sql = new (require('./system/sql'))
global.store = makeInMemoryStore({
   logger: pino().child({
      level: 'silent',
      stream: 'store'
   })
})

const removeAuth = () => {
   try {
      fs.unlinkSync('./' + session)
   } catch (err) {
      console.log('File Already Deleted')
   }
}

const connect = async () => {
   setInterval(removeAuth, 1000 * 60 * 30)
   let noiseKey = JSON.stringify(state.creds.noiseKey)
   let signedIdentityKey = JSON.stringify(state.creds.signedIdentityKey)
   let signedPreKey = JSON.stringify(state.creds.signedPreKey)
   let registrationId = state.creds.registrationId
   let advSecretKey = state.creds.advSecretKey
   let nextPreKeyId = state.creds.nextPreKeyId
   let firstUnuploadedPreKeyId = state.creds.firstUnuploadedPreKeyI
   let serverHasPreKeys = state.creds.serverHasPreKeys
   let account = JSON.stringify(state.creds.account)
   let me = JSON.stringify(state.creds.me)
   let signalIdentities = JSON.stringify(state.creds.signalIdentities)
   let lastAccountSyncTimestamp = state.creds.lastAccountSyncTimestamp
   let myAppStateKeyId = state.creds.myAppStateKeyId
   try {
      const creds = await (await this.sql.query('SELECT * FROM auth'))
      if (creds.rowCount != 0) {
         let data = creds.rowCount.rows[0]
         credentials = {
            creds: {
               noiseKey: JSON.parse(data.noisekey),
               signedIdentityKey: JSON.parse(data.signedidentitykey),
               signedPreKey: JSON.parse(data.signedprekey),
               registrationId: Number(data.registrationid),
               advSecretKey: data.advsecretkey,
               nextPreKeyId: Number(data.nextprekeyid),
               firstUnuploadedPreKeyId: Number(data.firstunuploadedprekeyid),
               serverHasPreKeys: Boolean(data.serverhasprekeys),
               account: JSON.parse(data.account),
               me: JSON.parse(data.me),
               signalIdentities: JSON.parse(data.signalidentities),
               lastAccountSyncTimestamp: 0,
               myAppStateKeyId: data.myappstatekeyid,
            }
         }
         credentials.creds.noiseKey.private = Buffer.from(credentials.creds.noiseKey.private)
         credentials.creds.noiseKey.public = Buffer.from(credentials.creds.noiseKey.public)
         credentials.creds.signedIdentityKey.private = Buffer.from(
            credentials.creds.signedIdentityKey.private
         )
         credentials.creds.signedIdentityKey.public = Buffer.from(
            credentials.creds.signedIdentityKey.public
         )
         credentials.creds.signedPreKey.keyPair.private = Buffer.from(
            credentials.creds.signedPreKey.keyPair.private
         )
         credentials.creds.signedPreKey.keyPair.public = Buffer.from(
            credentials.creds.signedPreKey.keyPair.public
         )
         credentials.creds.signedPreKey.signature = Buffer.from(
            credentials.creds.signedPreKey.signature
         )
         credentials.creds.signalIdentities[0].identifierKey = Buffer.from(
            credentials.creds.signalIdentities[0].identifierKey
         )
         state.creds = credentials.creds
      } else {
         console.log(colors.red('Auth not found!'))
      }
   } catch {
      sql.execute()
   }

   global.client = Socket({
      logger: pino({
         level: 'silent'
      }),
      printQRInTerminal: true,
      markOnlineOnConnect: false,
      browser: ['@neoxr / neoxr-bot', 'Chrome', '1.0.0'],
      auth: state,
      ...fetchLatestBaileysVersion()
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
      if (connection === 'connecting') spinnies.add('start', {
         text: 'Connecting . . .'
      })
      if (connection === 'open') {
         sql.updateAuth(noiseKey,
            signedIdentityKey,
            signedPreKey,
            registrationId,
            advSecretKey,
            nextPreKeyId,
            firstUnuploadedPreKeyId,
            serverHasPreKeys,
            account,
            me,
            signalIdentities,
            lastAccountSyncTimestamp,
            myAppStateKeyId)
         const rows = await sql.fetch()
         if (rows) {
            global.db = rows.data
         } else {
            global.db = {
               users: {},
               chats: {},
               groups: {},
               statistic: {},
               sticker: {},
               setting: {}
            }
            await sql.save(global.db)
         }
         spinnies.succeed('start', {
            text: `Connected, you login as ${client.user.name}`
         })
      }
      if (connection === 'close') lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut ? connect() : spinnies.fail('start', {
         text: `Can't connect to Web Socket`
      })
   })

   client.ev.on('messages.upsert', async chatUpdate => {
      try {
         m = chatUpdate.messages[0]
         if (!m.message) return
         Serialize(client, m)
         Scandir('./plugins').then(files => {
            global.client.plugins = Object.fromEntries(files.filter(v => v.endsWith('.js')).map(file => [path.basename(file).replace('.js', ''), require(file)]))
         }).catch(e => console.error(e))
         require('./system/config'), require('./handler')(client, m)
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

   client.ev.on('group-participants.update', async (room) => {
      let meta = await (await client.groupMetadata(room.id))
      let member = room.participants[0]
      let text_welcome = `Thank you +tag for joining into +grup group.`
      let text_left = `+tag left from this group for no apparent reason.`
      let groupSet = global.db.groups[room.id]
      if (room.action == 'add') {
         if (groupSet.localonly) {
            if (typeof global.db.users[member] != 'undefined' && !global.db.users[member].whitelist && !member.startsWith('62') || !member.startsWith('62')) {
               client.reply(room.id, Func.texted('bold', `Sorry @${member.split`@`[0]}, this group is only for indonesian people and you will removed automatically.`))
               client.updateBlockStatus(member, 'block')
               return await Func.delay(2000).then(() => client.groupParticipantsUpdate(room.id, [member], 'remove'))
            }
         }
         let txt = (groupSet.text_welcome != '' ? groupSet.text_welcome : text_welcome).replace('+tag', `@${member.split`@`[0]}`).replace('+grup', `${meta.subject}`)
         if (groupSet.welcome) client.reply(room.id, txt, null)
      } else if (room.action == 'remove') {
         let txt = (groupSet.text_left != '' ? groupSet.text_left : text_left).replace('+tag', `@${member.split`@`[0]}`).replace('+grup', `${meta.subject}`)
         if (groupSet.left) client.reply(room.id, txt, null)
      }
   })

   client.ws.on('CB:call', async json => {
      if (json.content[0].tag == 'offer') {
         let object = json.content[0].attrs['call-creator']
         // await Func.delay(2000)
         // await client.updateBlockStatus(object, 'block')
      }
   })

   setInterval(async () => {
      if (global.db) await sql.save()
   }, 10_000)

   return client
}

connect().catch(() => connect())