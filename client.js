process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'
const {
   useSingleFileAuthState,
   DisconnectReason
} = require('@adiwajshing/baileys')
const session = process.argv[2] ? process.argv[2] : 'session'
const sessionFile = session + '.json'
const {
   state,
   saveState
} = useSingleFileAuthState(sessionFile)
const pino = require('pino'),
   path = require('path')
const Spinnies = require('spinnies')
const spinnies = new Spinnies()
const StormDB = require('stormdb')
const engine = new StormDB.localFileEngine('./database.json', {
   serialize: data => {
      return JSON.stringify(data, null, 3)
   }
})
const database = new StormDB(engine)
const {
   Socket,
   Serialize,
   Scandir
} = require('./system/extra')
const {
   Function
} = require('./system/function')
global.Func = new Function
const {
   Scraper
} = require('./system/scraper')
global.scrap = new Scraper
const {
   NeoxrApi
} = require('./system/neoxrApi')

// Get free apikey register at https://api.neoxr.eu.org
global.Api = new NeoxrApi('YOUR_APIKEY_HERE')

const start = async () => {
   global.client = Socket({
      logger: pino({
         level: 'silent'
      }),
      printQRInTerminal: true,
      browser: ['@neoxr / neoxr-bot (multi-device)', 'Chrome', '3.0'],
      auth: state
   })

   client.ev.on('connection.update', async (update) => {
      const {
         connection,
         lastDisconnect
      } = update
      if (connection === 'connecting') spinnies.add('start', {
         text: 'Connecting . . .'
      })
      if (connection === 'open') spinnies.succeed('start', {
         text: `Connected, you login as ${client.user.name}`
      })
      if (connection === 'close') lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut ? start() : spinnies.fail('start', {
         text: `Can't connect to Web Socket`
      })
      database.default({
         users: {},
         groups: {},
         chats: {},
         statistic: {},
         sticker: {},
         setting: {}
      }).save()
      global.db = database.state
      global.save = database.save()
   })

   client.ev.on('messages.upsert', async chatUpdate => {
      try {
         m = chatUpdate.messages[0]
         if (!m.message) return
         Serialize(client, m)
         Scandir('./commands').then(files => {
            global.client.commands = Object.fromEntries(files.filter(v => v.endsWith('.js')).map(file => [path.basename(file).replace('.js', ''), require(file)]))
         }).catch(e => console.error(e))
         require('./system/config'), require('./handler')(client, m)
      } catch (e) {
         console.log(e)
      }
   })

   client.ev.on('group-participants.update', async (gc) => {
      let meta = await (await client.groupMetadata(gc.id))
      let groupSet = global.groups[gc.id]
      let member = gc.participants[0]
      let setting = global.setting
      let textwel = Func.texted('bold', `Welcome +tag in +grup's group.`)
      let textleft = Func.texted('bold', `Good bye +tag don't back here again.`)
      try {
         pic = await client.profilePictureUrl(member, 'image')
      } catch {
         pic = await client.profilePictureUrl(gc.id, 'image')
      }
      if (gc.action == 'add') {
         if (groupSet.localonly) {
            if (!member.startsWith('62')) {
               client.reply(gc.id, Func.texted('bold', `Sorry @${member.split`@`[0]}, this group is only for indonesian people and you will removed automatically.`))
               client.updateBlockStatus(member, 'block')
               return await Func.delay(2000).then(() => client.groupParticipantsUpdate(gc.id, [member], 'remove'))
            }
         }
         let txt = (groupSet.textwel != '' ? groupSet.textwel : textwel).replace('+tag', `@${member.split`@`[0]}`).replace('+grup', `${meta.subject}`)
         if (groupSet.welcome) return client.sendFile(gc.id, pic, '', txt, null)
      } else if (gc.action == 'remove') {
         let txt = (groupSet.textleft != '' ? groupSet.textleft : textleft).replace('+tag', `@${member.split`@`[0]}`).replace('+grup', `${meta.subject}`)
         if (groupSet.left) return client.sendFile(gc.id, pic, '', txt, null)
      }
   })

   client.ev.on('creds.update', saveState)
   let now = JSON.stringify(global.db)
   setInterval(async () => {
      JSON.stringify(global.db) != now ? await database.save() : ''
   }, 600000)
   return client
}

start()