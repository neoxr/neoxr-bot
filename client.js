"use strict";
require('events').EventEmitter.defaultMaxListeners = 500
const { Baileys, MongoDB, PostgreSQL, Scandir, Function: Func } = new(require('@neoxr/wb'))
const spinnies = new(require('spinnies'))(),
   fs = require('fs'),
   path = require('path'),
   colors = require('@colors/colors'),
   stable = require('json-stable-stringify'),
   env = require('./config.json')
const cache = new(require('node-cache'))({
   stdTTL: env.cooldown
})
if (process.env.DATABASE_URL && /mongo/.test(process.env.DATABASE_URL)) MongoDB.db = env.database
const machine = (process.env.DATABASE_URL && /mongo/.test(process.env.DATABASE_URL)) ? MongoDB : (process.env.DATABASE_URL && /postgres/.test(process.env.DATABASE_URL)) ? PostgreSQL : new(require('./lib/system/localdb'))(env.database)
const client = new Baileys({
   type: '--neoxr-v1',
   plugsdir: 'plugins',
   sf: 'session',
   online: true,
   version: [2, 2318, 11]
})

/* starting to connect */
client.on('connect', async res => {
   /* load database */
   global.db = {users:[], chats:[], groups:[], statistic:{}, sticker:{}, setting:{}, ...(await machine.fetch() ||{})}
   
   /* save database */
   await machine.save(global.db)

   /* write connection log */
   if (res && typeof res === 'object' && res.message) Func.logFile(res.message)
})

/* print error */
client.on('error', async error => {
   console.log(colors.red(error.message))
   if (error && typeof error === 'object' && error.message) Func.logFile(error.message)
})

/* bot is connected */
client.on('ready', async () => {
   /* auto restart if ram usage is over */
   const ramCheck = setInterval(() => {
      var ramUsage = process.memoryUsage().rss
      if (ramUsage >= require('bytes')(env.ram_limit)) {
         clearInterval(ramCheck)
         process.send('reset')
      }
   }, 60 * 1000)

   /* create temp directory if doesn't exists */
   if (!fs.existsSync('./temp')) fs.mkdirSync('./temp')

   /* require all additional functions */
   require('./lib/system/config'), require('./lib/system/baileys'), require('./lib/system/functions'), require('./lib/system/scraper')

   /* clear temp folder every 10 minutes */
   setInterval(() => {
      try {
         const tmpFiles = fs.readdirSync('./temp')
         if (tmpFiles.length > 0) {
            tmpFiles.filter(v => !v.endsWith('.file')).map(v => fs.unlinkSync('./temp/' + v))
         }
      } catch {}
   }, 60 * 1000 * 10)

   /* save database send http-request every 30 seconds */
   setInterval(async () => {
      if (global.db) await machine.save(global.db)
      if (process.env.CLOVYR_APPNAME && process.env.CLOVYR_URL && process.env.CLOVYR_COOKIE) {
         const response = await axios.get(process.env.CLOVYR_URL, {
            headers: {
               referer: 'https://clovyr.app/view/' + process.env.CLOVYR_APPNAME,
               cookie: process.env.CLOVYR_COOKIE
            }
         })
         Func.logFile(`${await response.status} - Application wake-up!`)
      }
   }, 30_000)
})

/* print all message object */
client.on('message', ctx => require('./handler')(client.sock, ctx))

/* print deleted message object */
client.on('message.delete', ctx => {
   const sock = client.sock  
   if (!ctx || ctx.origin.fromMe || ctx.origin.isBot || !ctx.origin.sender) return
   if (cache.has(ctx.origin.sender) && cache.get(ctx.origin.sender) === 1) return
   cache.set(ctx.origin.sender, 1)
   if (ctx.origin.isGroup && global.db.groups.some(v => v.jid == ctx.origin.chat) && global.db.groups.find(v => v.jid == ctx.origin.chat).antidelete) return sock.copyNForward(ctx.origin.chat, ctx.delete)
})

/* AFK detector */
client.on('presence.update', update => {
   if (!update) return
   const sock = client.sock
   const { id, presences } = update
   if (id.endsWith('g.us')) {
      for (let jid in presences) {
         if (!presences[jid] || jid == sock.decodeJid(sock.user.id)) continue
         if ((presences[jid].lastKnownPresence === 'composing' || presences[jid].lastKnownPresence === 'recording') && global.db.users.find(v => v.jid == jid) && global.db.users.find(v => v.jid == jid).afk > -1) {
            sock.reply(id, `System detects activity from @${jid.replace(/@.+/, '')} after being offline for : ${Func.texted('bold', Func.toTime(new Date - global.db.users.find(v => v.jid == jid).afk))}\n\n➠ ${Func.texted('bold', 'Reason')} : ${global.db.users.find(v => v.jid == jid).afkReason ? global.db.users.find(v => v.jid == jid).afkReason : '-'}`, global.db.users.find(v => v.jid == jid).afkObj)
            global.db.users.find(v => v.jid == jid).afk = -1
            global.db.users.find(v => v.jid == jid).afkReason = ''
            global.db.users.find(v => v.jid == jid).afkObj = {}
         }
      }
   } else {}
})

client.on('group.add', async ctx => {
   const sock = client.sock
   const text = `Thanks +tag for joining into +grup group.`
   const groupSet = global.db.groups.find(v => v.jid == ctx.jid)
   try {
      var pic = await Func.fetchBuffer(await sock.profilePictureUrl(ctx.member, 'image'))
   } catch {
      var pic = await Func.fetchBuffer(await sock.profilePictureUrl(ctx.jid, 'image'))
   }

   /* localonly to remove new member when the number not from indonesia */
   if (groupSet && groupSet.localonly) {
      if (global.db.users.some(v => v.jid == ctx.member) && !global.db.users.find(v => v.jid == ctx.member).whitelist && !ctx.member.startsWith('62') || !ctx.member.startsWith('62')) {
         sock.reply(ctx.jid, Func.texted('bold', `Sorry @${ctx.member.split`@`[0]}, this group is only for indonesian people and you will removed automatically.`))
         sock.updateBlockStatus(member, 'block')
         return await Func.delay(2000).then(() => sock.groupParticipantsUpdate(ctx.jid, [ctx.member], 'remove'))
      }
   }

   const txt = (groupSet && groupSet.text_welcome ? groupSet.text_welcome : text).replace('+tag', `@${ctx.member.split`@`[0]}`).replace('+grup', `${ctx.subject}`)
   if (groupSet && groupSet.welcome) sock.sendMessageModify(ctx.jid, txt, null, {
      largeThumb: true,
      thumbnail: pic,
      url: global.db.setting.link
   })
})

client.on('group.remove', async ctx => {
   const sock = client.sock
   const text = `Good bye +tag :)`
   const groupSet = global.db.groups.find(v => v.jid == ctx.jid)
   try {
      var pic = await Func.fetchBuffer(await sock.profilePictureUrl(ctx.member, 'image'))
   } catch {
      var pic = await Func.fetchBuffer(await sock.profilePictureUrl(ctx.jid, 'image'))
   }
   const txt = (groupSet && groupSet.text_left ? groupSet.text_left : text).replace('+tag', `@${ctx.member.split`@`[0]}`).replace('+grup', `${ctx.subject}`)
   if (groupSet && groupSet.left) sock.sendMessageModify(ctx.jid, txt, null, {
      largeThumb: true,
      thumbnail: pic,
      url: global.db.setting.link
   })
})

client.on('caller', ctx => {
	if (typeof ctx === 'boolean') return
	client.sock.updateBlockStatus(ctx.jid, 'block')
})

// client.on('group.promote', ctx => console.log(ctx))
// client.on('group.demote', ctx => console.log(ctx))