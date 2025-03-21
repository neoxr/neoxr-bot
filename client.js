"use strict";
// process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'
require('events').EventEmitter.defaultMaxListeners = 500
const { Component } = require('@neoxr/wb')
const { Baileys, Function: Func, Config: env } = new Component
require('./lib/system/functions'), require('./lib/system/scraper'), require('./lib/system/config')
const fs = require('fs')
const colors = require('@colors/colors')
const { NodeCache } = require('@cacheable/node-cache')
const cache = new NodeCache({
   stdTTL: env.cooldown
})

const connect = async () => {
   try {
      // Documentation : https://github.com/neoxr/session
      const session = (process?.env?.DATABASE_URL && /mongo/.test(process.env.DATABASE_URL))
         ? require('@session/mongo').useMongoAuthState
         : (process?.env?.DATABASE_URL && /postgres/.test(process.env.DATABASE_URL))
            ? require('@session/postgres').usePostgresAuthState
            : null


      // Documentation : https://github.com/neoxr/database
      const database = await ((process?.env?.DATABASE_URL && /mongo/.test(process.env.DATABASE_URL))
         ? require('@database/mongo').createDatabase(process.env.DATABASE_URL, env.database, 'database')
         : (process?.env?.DATABASE_URL && /postgres/.test(process.env.DATABASE_URL))
            ? require('@database/postgres').createDatabase(process.env.DATABASE_URL, env.database)
            : require('@database/local').createDatabase(env.database))

      const client = new Baileys({
         type: '--neoxr-v1',
         plugsdir: 'plugins',
         session: session ? session(process.env.DATABASE_URL, 'session') : 'session',
         online: true,
         bypass_disappearing: true,
         version: [2, 3000, 1020608496] // To see the latest version : https://wppconnect.io/whatsapp-versions/
      })

      /* starting to connect */
      client.once('connect', async res => {
         /* load database */
         global.db = { users: [], chats: [], groups: [], statistic: {}, sticker: {}, setting: {}, ...(await database.fetch() || {}) }
         /* save database */
         await database.save(global.db)
         /* write connection log */
         if (res && typeof res === 'object' && res.message) Func.logFile(res.message)
      })

      /* print error */
      client.once('error', async error => {
         console.log(colors.red(error.message))
         if (error && typeof error === 'object' && error.message) Func.logFile(error.message)
      })

      /* bot is connected */
      client.once('ready', async () => {
         /* auto restart if ram usage is over */
         const ramCheck = setInterval(() => {
            var ramUsage = process.memoryUsage().rss
            if (ramUsage >= require('bytes')(env.ram_limit)) {
               clearInterval(ramCheck)
               process.send('reset')
            }
         }, 60 * 1000) // check ram usage every 1 min

         /* create temp directory if doesn't exists */
         if (!fs.existsSync('./temp')) fs.mkdirSync('./temp')

         /* clear temp folder every 10 minutes */
         setInterval(async () => {
            try {
               const tmpFiles = fs.readdirSync('./temp')
               if (tmpFiles.length > 0) {
                  tmpFiles.filter(v => !v.endsWith('.file')).map(v => fs.unlinkSync('./temp/' + v))
               }
            } catch { }
         }, 60 * 1000 * 10) // clear ./temp folder every 10 mins

         /* save database every 5 mins */
         setInterval(async () => {
            if (global.db) await database.save(global.db)
         }, 60 * 1000 * 5)
      })

      /* print all message object */
      client.register('message', ctx => {
         require('./handler')(client.sock, { ...ctx, database })
         require('./lib/system/baileys')(client.sock)
      })

      /* print deleted message object */
      client.register('message.delete', ctx => {
         const sock = client.sock
         if (!ctx || ctx.origin.fromMe || ctx.origin.isBot || !ctx.origin.sender) return
         if (cache.has(ctx.origin.sender) && cache.get(ctx.origin.sender) === 1) return
         cache.set(ctx.origin.sender, 1)
         if (Object.keys(ctx.delete.message) < 1) return
         if (ctx.origin.isGroup && global.db.groups.some(v => v.jid == ctx.origin.chat) && global.db.groups.find(v => v.jid == ctx.origin.chat).antidelete) return sock.copyNForward(ctx.origin.chat, ctx.delete)
      })

      /* AFK detector */
      client.register('presence.update', update => {
         if (!update) return
         const sock = client.sock
         const { id, presences } = update
         if (id.endsWith('g.us')) {
            for (let jid in presences) {
               if (!presences[jid] || jid == sock.decodeJid(sock.user.id)) continue
               if ((presences[jid].lastKnownPresence === 'composing' || presences[jid].lastKnownPresence === 'recording') && global.db && global.db.users && global.db.users.find(v => v.jid == jid) && global.db.users.find(v => v.jid == jid).afk > -1) {
                  sock.reply(id, `System detects activity from @${jid.replace(/@.+/, '')} after being offline for : ${Func.texted('bold', Func.toTime(new Date - global.db.users.find(v => v.jid == jid).afk))}\n\n➠ ${Func.texted('bold', 'Reason')} : ${global.db.users.find(v => v.jid == jid).afkReason ? global.db.users.find(v => v.jid == jid).afkReason : '-'}`, global.db.users.find(v => v.jid == jid).afkObj)
                  global.db.users.find(v => v.jid == jid).afk = -1
                  global.db.users.find(v => v.jid == jid).afkReason = ''
                  global.db.users.find(v => v.jid == jid).afkObj = {}
               }
            }
         } else { }
      })

      client.register('group.add', async ctx => {
         const sock = client.sock
         const text = `Thanks +tag for joining into +grup group.`
         const groupSet = global.db.groups.find(v => v.jid == ctx.jid)
         if (!global.db || !global.db.groups) return
         try {
            var pic = await sock.profilePictureUrl(ctx.member, 'image')
            if (!pic) {
               var pic = 'https://qu.ax/uPqo.jpg'
            }
         } catch {
            var pic = 'https://qu.ax/uPqo.jpg'
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

      client.register('group.remove', async ctx => {
         const sock = client.sock
         const text = `Good bye +tag :)`
         if (!global.db || !global.db.groups) return
         const groupSet = global.db.groups.find(v => v.jid == ctx.jid)
         try {
            var pic = await sock.profilePictureUrl(ctx.member, 'image')
            if (!pic) {
               var pic = 'https://qu.ax/uPqo.jpg'
            }
         } catch {
            var pic = 'https://qu.ax/uPqo.jpg'
         }
         const txt = (groupSet && groupSet.text_left ? groupSet.text_left : text).replace('+tag', `@${ctx.member.split`@`[0]}`).replace('+grup', `${ctx.subject}`)
         if (groupSet && groupSet.left) sock.sendMessageModify(ctx.jid, txt, null, {
            largeThumb: true,
            thumbnail: pic,
            url: global.db.setting.link
         })
      })

      client.register('caller', ctx => {
         if (typeof ctx === 'boolean') return
         client.sock.updateBlockStatus(ctx.jid, 'block')
      })

      // client.on('group.promote', ctx => console.log(ctx))
      // client.on('group.demote', ctx => console.log(ctx))

   } catch (e) {
      throw new Error(e)
   }
}

connect().catch(() => connect())