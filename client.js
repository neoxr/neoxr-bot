"use strict";
// process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'
require('./error'), require('events').EventEmitter.defaultMaxListeners = 500
const { Component } = require('@neoxr/wb')
const { Baileys, Function: Func, Config: env } = new Component
require('./lib/system/functions'), require('./lib/system/scraper'), require('./lib/system/config')
const cron = require('node-cron')
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
         bot: id => {
            // Detect message from bot by message ID, you can add another logic here
            return id && ((id.startsWith('3EB0') && id.length === 40) || id.startsWith('BAE') || /[-]/.test(id))
         },
         presence: true, // 'true' if you want to see the bot typing or recording
         code: '', // Custom pairing code 8 chars (e.g: NEOXRBOT)
         version: [2, 3000, 1023223821] // To see the latest version : https://wppconnect.io/whatsapp-versions/
      }, {
         browser: ['Ubuntu', 'Firefox', '20.0.00'],
         shouldIgnoreJid: jid => {
            return /(newsletter|bot)/.test(jid)
         }
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

         /* backup database every day at 12:00 PM (send .json file to owner) */
         cron.schedule('0 12 * * *', async () => {
            if (global?.db?.setting?.autobackup) {
               await database.save(global.db)
               fs.writeFileSync(env.database + '.json', JSON.stringify(global.db, null, 3), 'utf-8')
               await client.sock.sendFile(env.owner + '@s.whatsapp.net', fs.readFileSync('./' + env.database + '.json'), env.database + '.json', '', null)
            }
         })
      })

      /* print all message object */
      client.register('message', ctx => {
         require('./handler')(client.sock, { ...ctx, database })
         require('./lib/system/baileys')(client.sock)
      })

      /* stories reaction */
      client.register('stories', async ctx => {
         if (ctx.message.key && ctx.sender !== client.sock.decodeJid(client.sock.user.id)) await client.sock.sendMessage('status@broadcast', {
            react: {
               text: Func.random(['🤣', '🥹', '😂', '😋', '😎', '🤓', '🤪', '🥳', '😠', '😱', '🤔']),
               key: ctx.message.key
            }
         }, {
            statusJidList: [ctx.sender]
         })
      })

      /* print deleted message object */
      client.register('message.delete', ctx => {
         const sock = client.sock
         if (!ctx || ctx.message?.key?.fromMe || ctx.message?.isBot || !ctx.message?.sender) return
         if (cache.has(ctx.message.sender) && cache.get(ctx.message.sender) === 1) return
         cache.set(ctx.message.sender, 1)
         if (Object.keys(ctx.message) < 1) return
         if (ctx.message.isGroup && global.db.groups.some(v => v.jid == ctx.message.chat) && global.db.groups.find(v => v.jid == ctx.message.chat).antidelete) return sock.copyNForward(ctx.message.chat, ctx.message)
      })

      /* AFK detector */
      client.register('presence.update', update => {
         if (!update) return
         const sock = client.sock
         if (!global.db) return
         const { id, presences } = update
         if (id.endsWith('g.us')) {
            let groupSet = global.db?.groups?.find(v => v.jid === id)
            for (let sender in presences) {
               let user = global.db?.users?.find(v =>
                  v.jid === sender || v.lid === sender
               )
               const presence = presences[user?.jid] || presences[user?.lid]
               if (!presence || user?.lid === sock.decodeJid(sock.user.lid)) continue
               if ((presence.lastKnownPresence === 'composing' || presence.lastKnownPresence === 'recording') && user.afk > -1) {
                  sock.reply(id, `System detects activity from @${user.jid.replace(/@.+/, '')} after being offline for : ${Func.texted('bold', Func.toTime(new Date - (user?.afk || 0)))}\n\n➠ ${Func.texted('bold', 'Reason')} : ${user?.afkReason || '-'}`, user?.afkObj)
                  user.afk = -1
                  user.afkReason = ''
                  user.afkObj = {}
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
               var pic = fs.readFileSync('./media/image/default.jpg')
            }
         } catch {
            var pic = fs.readFileSync('./media/image/default.jpg')
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
               var pic = fs.readFileSync('./media/image/default.jpg')
            }
         } catch {
            var pic = fs.readFileSync('./media/image/default.jpg')
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