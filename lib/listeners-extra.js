import { Utils, Config } from '@neoxr/zapo'
import ZapoJS from '../lib/zapo.js'
import { models } from '../lib/models.js'
import path from 'path'
import fs from 'node:fs'
import colors from 'colors'
import Notifier from './notifier.js'

let handler = null
const handlerPath = path.resolve('./handler.js')
Utils.watchThisFile(handlerPath, (mod) => {
   handler = mod.default
})

const buffers = new Map()
export default async (system, client) => {
   try {
      if (client.options.debug) console.log(colors.yellow('EXTRA LISTENERS] Registering extra listeners'))

      const notify = new Notifier(client.sock, false)
      notify.start()

      client.on('presence', ctx => {
         const { chat, user, type } = ctx
         const { sock } = client

         if (!global.db) return

         if (chat.endsWith('g.us')) {
            const database = global.db
            const group = database?.groups?.get(chat)
            if (!group) return

            const users = database.users.get(user)

            if (['composing', 'recording'].includes(type) && users?.afk > 1) {
               sock.reply(chat, `System detects activity from @${user.replace(/@.+/, '')} after being offline for : ${Utils.texted('bold', Utils.toTime(new Date - (users?.afk || 0)))}\n\n➠ ${Utils.texted('bold', 'Reason')} : ${users?.afkReason || '-'}`, users?.afkObj).then(() => {
                  users.afk = -1
                  users.afkReason = ''
                  users.afkObj = {}
               })
            }
         }
      })

      client.on('message', ctx => {
         handler(client.sock, { ...ctx, system, connector: client }).catch(console.error)
      })

      client.on('group.add', async ctx => {
         const { jid, author, member, subject } = ctx
         if (!jid || !author || !member || !subject) return

         const database = global.db
         const group = database?.groups?.get(jid)
         if (!group) return

         if (group?.welcome) {
            const caption = (group.text_welcome || `Thanks +tag for joining into +grup group.`)
               .replace('+tag', `@${member.split`@`[0]}`)
               .replace('+grup', `${subject}`)

            const avatar = await client.sock.profilePicture(member)

            return client.sock.sendMessageModify(jid, caption, null, {
               largeThumb: true,
               thumbnail: avatar,
               type: 'preview-link',
               /* choose: landscape (default), potrait, square */
               ratio: 'square',
               url: database.setting.link
            })
         }
      })

      client.on('group.remove', async ctx => {
         const { jid, author, member, subject } = ctx
         if (!jid || !author || !member || !subject) return

         const database = global.db
         const group = database?.groups?.get(jid)
         if (!group) return

         const entry = Object.entries(group.member ?? {}).find(
            ([, value]) => value?.lid === member
         )

         if (entry) {
            const [memberJid] = entry
            delete group.member[memberJid]
         }

         if (group?.left) {
            const caption = (group.text_left || `Good bye +tag`)
               .replace('+tag', `@${member.split`@`[0]}`)
               .replace('+grup', `${subject}`)

            const avatar = await client.sock.profilePicture(member)

            return client.sock.sendMessageModify(jid, caption, null, {
               largeThumb: true,
               thumbnail: avatar,
               type: 'preview-link',
               /* choose: landscape (default), potrait, square */
               ratio: 'square',
               url: database.setting.link
            })
         }
      })

      client.on('group.promote', async ctx => {
         const { jid, author, member } = ctx
         if (!jid || !author || !member) return

         const database = global.db
         const group = database?.groups?.get(jid)

         if (group?.actinfo) {
            const authorNum = author.split('@')[0]
            const memberNum = member.split('@')[0]

            const text = `▲ @${authorNum} promoted @${memberNum} to admin.`

            return client.sock.reply(jid, text)
         }
      })

      client.on('group.demote', ctx => {
         const { jid, author, member } = ctx
         if (!jid || !author || !member) return

         const database = global.db
         const group = database?.groups?.get(jid)

         if (group?.actinfo) {
            const authorNum = author.split('@')[0]
            const memberNum = member.split('@')[0]

            const text = `▼ @${authorNum} demoted @${memberNum} from admin.`

            return client.sock.reply(jid, text)
         }
      })

      client.on('group.request', ctx => {
         const { jid, author } = ctx
         if (!jid || !author) return

         const database = global.db
         const group = database?.groups?.get(jid)

         if (group?.actinfo) {
            const authorNum = author.split('@')[0]

            if (ctx?.action === 'revoked') {
               client.sock.reply(jid, `− @${authorNum} has cancelled their request to join.`)
            } else if (ctx?.action === 'created') {
               client.sock.reply(jid, `+ @${authorNum} is requesting to join this group.`)
            }
         }
      })

      client.on('message.delete', async ctx => {
         const database = global.db
         const group = database?.groups?.get(ctx.message.chat)

         if (group?.antidelete) {
            if (ctx.message && !/status|newsletter/i.test(ctx?.message?.chat)) await client.sock.message.send(ctx.message.chat, ctx.message.message, { forward: { score: 4 } })
         }
      })

   } catch (error) {}
}