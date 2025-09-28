import { Utils, Config } from '@neoxr/wb'
import baileys from '../lib/baileys.js'
import handler from '../handler.js'
import fs from 'node:fs'
import colors from 'colors'
import Notifier from './notifier.js'
import { models } from './models.js'
import { NodeCache } from '@cacheable/node-cache'
const cache = new NodeCache({
   stdTTL: Config.cooldown
})

export default (system, client) => {
   try {
      if (client.options.debug) console.log(colors.yellow('EXTRA LISTENERS] Registering extra listeners'))
      const notify = new Notifier(client.sock, false)
      notify.start(15)

      client.register('stories', async ctx => {
         if (ctx.message.key && ctx.sender !== client.sock.decodeJid(client.sock.user.id)) {
            await client.sock.sendMessage('status@broadcast', {
               react: {
                  text: Utils.random(['🤣', '🥹', '😂', '😋', '😎', '🤓', '🤪', '🥳', '😠', '😱', '🤔']),
                  key: ctx.message.key
               }
            }, {
               statusJidList: [ctx.sender]
            })
         }
      })

      client.register('message.delete', ctx => {
         const { sock } = client
         if (!ctx || ctx.message?.key?.fromMe || ctx.message?.isBot || !ctx.message?.sender) return
         if (cache.has(ctx.message.sender) && cache.get(ctx.message.sender) === 1) return
         cache.set(ctx.message.sender, 1)
         if (Object.keys(ctx.message) < 1) return
         if (ctx.message.isGroup && global.db.groups.some(v => v.jid == ctx.message.chat) && global.db.groups.find(v => v.jid == ctx.message.chat).antidelete) return sock.copyNForward(ctx.message.chat, ctx.message)
      })

      client.register('presence.update', update => {
         if (!update) return
         const { sock } = client
         if (!global.db) return
         const { id, presences } = update
         if (id.endsWith('g.us')) {
            let groupSet = global.db?.groups?.find(v => v.jid === id)
            for (let sender in presences) {
               let user = global.db?.users?.find(v =>
                  v.jid === sender || v.lid === sender
               )
               const presence = presences[user?.jid] || presences[user?.lid]
               if (!presence || user?.lid === sock.decodeJid(sock.user.lid) || !user?.afk) continue
               if ((presence.lastKnownPresence === 'composing' || presence.lastKnownPresence === 'recording') && user.afk > -1) {
                  sock.reply(id, `System detects activity from @${user.jid.replace(/@.+/, '')} after being offline for : ${Utils.texted('bold', Utils.toTime(new Date - (user?.afk || 0)))}\n\n➠ ${Utils.texted('bold', 'Reason')} : ${user?.afkReason || '-'}`, user?.afkObj)
                  user.afk = -1
                  user.afkReason = ''
                  user.afkObj = {}
               }
            }
         } else { }
      })

      client.register('message', ctx => {
         baileys(client.sock)
         handler(client.sock, { ...ctx, system })
      })

      client.register('group.add', async ctx => {
         const sock = client.sock
         const text = `Thanks +tag for joining into +grup group.`
         if (!global?.db?.groups || !ctx.member) return
         const memberId = ctx.member
         const groupSet = global.db.groups.find(v => v.jid == ctx.jid)

         let pic = fs.readFileSync('./media/image/default.jpg')
         try {
            pic = await sock.profilePictureUrl(ctx.member, 'image') || fs.readFileSync('./media/image/default.jpg')
         } catch {
            pic = fs.readFileSync('./media/image/default.jpg')
         }

         if (groupSet && groupSet.localonly) {
            if (global.db.users.some(v => v.jid == ctx.member) && !global.db.users.find(v => v.jid == ctx.member).whitelist && !ctx.member.startsWith('62') || !ctx.member.startsWith('62')) {
               sock.reply(ctx.jid, Utils.texted('bold', `Sorry @${ctx.member.split`@`[0]}, this group is only for indonesian people and you will removed automatically.`))
               sock.updateBlockStatus(member, 'block')
               return await Utils.delay(2000).then(() => sock.groupParticipantsUpdate(ctx.jid, [ctx.member], 'remove'))
            }
         }

         const isAdmin = ctx.groupMetadata?.participants?.some(
            v => (v.phoneNumber === sock.decodeJid(sock.user.id) || v.id === sock.decodeJid(sock.user.id)) && v.admin
         )

         if (groupSet.member?.[memberId]?.left && isAdmin) {
            sock.groupParticipantsUpdate(ctx.jid, [memberId], 'remove')
            delete groupSet.member[memberId]
            return
         }

         if (!groupSet.member?.[memberId]) {
            groupSet.member[memberId] = { ...models.member }
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
         if (!global?.db?.groups || !ctx.member) return
         const memberId = ctx.member

         const groupSet = global.db.groups.find(v => v.jid == ctx.jid)
         if (!groupSet) return

         let pic = fs.readFileSync('./media/image/default.jpg')
         try {
            pic = await sock.profilePictureUrl(ctx.member, 'image') || fs.readFileSync('./media/image/default.jpg')
         } catch {
            pic = fs.readFileSync('./media/image/default.jpg')
         }

         if (groupSet.member?.[memberId]) {
            groupSet.member[memberId].left = true
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
   } catch (e) {
      Utils.printError(e)
   }
}