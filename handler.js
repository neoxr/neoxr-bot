import { Config, Utils, Spam, Cooldown } from '@neoxr/zapo'
import { models } from './lib/models.js'

const cooldown = new Cooldown(Config.cooldown)
const spam = new Spam({
   RESET_TIMER: Config.cooldown,
   HOLD_TIMER: Config.timeout,
   HOLD_THRESHOLD: Config.hold_threshold,
   PERMANENT_THRESHOLD: Config.permanent_threshold,
   NOTIFY_THRESHOLD: Config.notify_threshold,
   BANNED_THRESHOLD: Config.banned_threshold
})

import path from 'path'
import fs from 'fs'
import cron from 'node-cron'
import schema from './lib/schema.js'

if (!global.typo) global.typo = new Map()

export default async (client, context) => {
   try {
      let { store, m, body, prefix, plugins, commands, args, command, text, prefixes, core, system, connector } = context

      const [groupMetadata, blockList] = await Promise.all([
         m.isGroup ? client.groupMetadata?.(m.chat) : Promise.resolve({}),
         client.privacy.getBlocklist().then(res => res?.jids || []).catch(() => [])
      ])

      schema(m, Config)

      const groupSet = global.db.groups.get(m.chat)
      const chats = global.db.chats.get(m.chat)
      const users = global.db.users.get(m.sender)
      const setting = global.db.setting

      const owners = [client.decodeJid(client.getCredentials()?.meJid).replace(/@.+/, ''), Config.owner, ...setting.owners].filter(Boolean)
      const isOwner = owners.some(v => {
         v = String(v)

         const validator = (
            Utils.validatePhone(v).valid
               ? `${v}@s.whatsapp.net`
               : `${v}@lid`
         )

         const jid = m.sender === validator
         const lid = m.key?.participant === validator

         return jid || lid
      })

      const isPrem = users && users.premium || isOwner
      const participants = m.isGroup ? groupMetadata ? client.getParticiapantsJid(groupMetadata.participants) : [] : [] || []
      const admins = m.isGroup ? client.getGroupAdmins(groupMetadata.participants) : []
      const isAdmin = m.isGroup ? admins.includes(m.sender) : false
      const isBotAdmin = m.isGroup ? admins.includes(client.decodeJid(client.getCredentials()?.meJid)) : false

      if (body && !isNaN(body) && global.typo.has(m.sender)) {
         let session = global.typo.get(m.sender)
         let choice = parseInt(body) - 1

         if (session.commands && session.commands[choice]) {
            let selectedCommand = session.commands[choice]
            clearTimeout(session.timeout)

            command = selectedCommand
            prefix = session.prefix
            text = session.text || ''
            args = session.args || []
            body = prefix + command + (text ? ' ' + text : '')

            if (session.quoted) {
               m.quoted = session.quoted
            }

            context.command = command
            context.prefix = prefix
            context.body = body
            context.args = args
            context.text = text
            if (context.core) {
               context.core.prefix = prefix
               context.core.command = command
            }

            global.typo.delete(m.sender)
            await client.reply(m.chat, `🚀 Executing *${prefix + command}*...`, m)
         }
      }

      const isSpam = spam.detection(client, m, {
         prefix, command, commands, users, cooldown,
         show: 'all', // options: 'all' | 'command-only' | 'message-only' | 'spam-only'| 'none'
         banned_times: users?.ban_times,
         exception: isOwner || isPrem,
         store
      })

      plugins = Object.fromEntries(Object.entries(plugins).filter(([dir, _]) => !setting.pluginDisable.includes(path.basename(dir, '.js'))))

      if (setting.online) {
         client.message.sendReceipt(m, { type: 'read' })
      }

      if (!setting.multiprefix) setting.noprefix = false
      if (setting.debug && !m.fromMe && isOwner) client.reply(m.chat, Utils.jsonFormat(m), m)
      if (m.isGroup) groupSet.activity = new Date() * 1

      if (typeof users !== 'undefined' && !users?.lid) users.lid = m.rawNode?.attrs?.participant ?? m.rawNode?.attr?.from

      if (chats) {
         chats.chat += 1
         chats.lastseen = new Date * 1
      }

      cron.schedule('00 00 * * *', () => {
         setting.lastReset = new Date * 1
         global.db.users.filter(v => v.limit < Config.limit && !v.premium).map(v => v.limit = Config.limit)
         Object.entries(global.db.statistic).map(([_, prop]) => prop.today = 0)
      }, {
         scheduled: true,
         timezone: process.env.TZ
      })

      if (m.isGroup && groupSet) {
         const now = Date.now()
         const TWO_DAYS = 2 * 24 * 60 * 60 * 1000

         groupSet.activity = now

         if (groupSet.member) {
            for (const jid of Object.keys(groupSet.member)) {
               const member = groupSet.member[jid]
               if (!member) continue

               const lastseen = member.lastseen ? new Date(member.lastseen).getTime() : 0
               if (member.left && (!lastseen || now - lastseen > TWO_DAYS)) {
                  delete groupSet.member[jid]
               }
            }
         }
      }

      if (m.isGroup && !m.fromMe) {
         const now = new Date() * 1

         const member = Utils.getMemberBySender(groupSet.member, m.sender)

         if (member) {
            if (!member.jid) member.jid = m.sender
            if (!member.lid) member.lid = m.key.participant
            member.lastseen = now

            if (member.afk > -1) {
               client.reply(m.chat, `You are back online after being offline for : ${Utils.texted('bold', Utils.toTime(new Date - member.afk))}\n\n• ${Utils.texted('bold', 'Reason')}: ${member?.afkReason || '-'}`, m).thrn(() => {
                  member.afk = -1
                  member.afkReason = ''
                  member.afkObj = {}
               })
            }
         } else {
            groupSet.member[m.sender] = {
               jid: m.sender,
               lid: m.key.participant,
               ...models.member
            }
         }
      }

      if (body && !setting.self && core.prefix != setting.onlyprefix && commands.includes(core.command) && !setting.multiprefix && !Config.evaluate_chars.includes(core.command)) return client.reply(m.chat, `❌ *Incorrect prefix!*, this bot uses prefix : *[ ${setting.onlyprefix} ]*\n\n➠ ${setting.onlyprefix + core.command} ${text || ''}`, m)

      const matcher = Utils.matcher(command, commands).filter(v => v.accuracy >= 60)
      if (prefix && !commands.includes(command) && matcher.length > 0 && !setting.self) {
         if (!m.isGroup || (m.isGroup && !groupSet.mute)) {

            if (global.typo.has(m.sender)) clearTimeout(global.typo.get(m.sender).timeout)

            let mime = (m.quoted ? m.quoted.mtype : m.mtype)
            let isMedia = /image|video|sticker|audio|document/.test(mime)

            global.typo.set(m.sender, {
               commands: matcher.slice(0, 3).map(v => v.string),
               prefix: prefix,
               text: text,
               args: args,
               quoted: m.quoted ? m.quoted : (isMedia ? m : null),
               timeout: setTimeout(() => {
                  global.typo.delete(m.sender)
               }, 180000)
            })

            let caption = `❌ *Command not found.* Did you mean :\n\n`
            caption += global.typo.get(m.sender).commands.map((v, i) => `*${i + 1}.* ${prefix + v} (${matcher[i].accuracy}%)`).join('\n')
            caption += `\n\n> Reply with the *number* to execute. (Expires in 3 minutes)`

            return client.reply(m.chat, caption, m)
         }
      }

      if (
         body && prefix && commands.includes(command) && setting.multiprefix && setting.prefix.includes(prefix) ||
         body && !prefix && commands.includes(command) && setting.noprefix ||
         body && prefix && commands.includes(command) && !setting.multiprefix && setting.onlyprefix === prefix ||
         body && !prefix && commands.includes(command) && Config.evaluate_chars.includes(command)
      ) {
         if (setting.error.includes(command)) return client.reply(m.chat, Utils.texted('bold', `❌ Command _${(prefix ? prefix : '') + command}_ disabled.`), m)
         if (!m.isGroup && Config.blocks.some(no => m.sender?.startsWith(no))) return client.updateBlockStatus(m.sender, 'block')
         if (commands.includes(command)) {
            users.hit += 1
            users.usebot = new Date() * 1
            Utils.hitstat(command, m.sender)
         }

         const is_commands = Object.fromEntries(Object.entries(plugins).filter(([name, prop]) => prop.run.usage))
         for (const [pluginPath, pluginData] of Object.entries(is_commands)) {
            const name = path.basename(pluginPath, '.js')
            const cmd = pluginData.run
            const turn = cmd.usage instanceof Array ? cmd.usage.includes(command) : cmd.usage instanceof String ? cmd.usage == command : false
            const turn_hidden = cmd.hidden instanceof Array ? cmd.hidden.includes(command) : cmd.hidden instanceof String ? cmd.hidden == command : false
            if (!turn && !turn_hidden) continue

            if ((m.fromMe && m.isBot) || /broadcast|newsletter/.test(m.chat)) continue

            let allowed = true

            if (setting.self && !isOwner && !m.fromMe) allowed = false

            if (allowed && !m.isGroup && !['owner'].includes(name) && chats && !isPrem && !users.banned && new Date() * 1 - chats.lastchat < Config.timeout) allowed = false

            if (allowed && !m.isGroup && !['owner', 'premium'].includes(name) && chats && !isPrem && !users.banned && setting.groupmode) allowed = false

            if (allowed && !['me', 'owner', 'exec'].includes(name) && users && (users.banned || new Date - users.ban_temporary < Config.timeout)) {
               client.reply(m.chat, Utils.texted('bold', `⚠️ ${isSpam.msg}`), m)
               allowed = false
            }

            if (allowed && m.isGroup && !['activation', 'groupinfo'].includes(name) && groupSet.mute) allowed = false
            if (allowed && cmd.owner && !isOwner) {
               client.reply(m.chat, global.status.owner, m)
               allowed = false
            }

            if (allowed && cmd.restrict && !isPrem && !isOwner && text && new RegExp('\\b' + setting.toxic.join('\\b|\\b') + '\\b').test(text.toLowerCase())) {
               client.reply(m.chat, `⚠️ You violated the *Terms & Conditions* of using bots by using blacklisted keywords, as a penalty for your violation being blocked and banned.`, m).then(() => {
                  users.banned = true
                  client.updateBlockStatus(m.sender, 'block')
               })
               allowed = false
            }

            if (allowed && setting.antispam && isSpam && /(BANNED|NOTIFY)/.test(isSpam.state)) {
               client.reply(m.chat, Utils.texted('bold', `⚠️ ${isSpam.msg}`), m)
               allowed = false
            }

            if (allowed && setting.antispam && isSpam && /HOLD/.test(isSpam.state)) allowed = false
            if (allowed && cmd.premium && !isPrem) {
               client.reply(m.chat, global.status.premium, m)
               allowed = false
            }

            if (allowed && cmd.limit && users.limit < 1) {
               client.reply(m.chat, `⚠️ You reached the limit and will be reset at 00.00\n\nTo get more limits upgrade to premium plans.`, m).then(() => users.premium = false)
               allowed = false
            }

            let limitCost = 0
            if (allowed && cmd.limit) {
               limitCost = cmd.limit.constructor.name == 'Boolean' ? 1 : cmd.limit
               if (users.limit < limitCost) {
                  client.reply(m.chat, Utils.texted('bold', `⚠️ Your limit is not enough to use this feature, will be reset at 00.00.`), m)
                  allowed = false
               }
            }

            if (allowed) {
               if (cmd.group && !m.isGroup) {
                  client.reply(m.chat, global.status.group, m)
               } else if (cmd.botAdmin && !isBotAdmin) {
                  client.reply(m.chat, global.status.botAdmin, m)
               } else if (cmd.admin && !isAdmin) {
                  client.reply(m.chat, global.status.admin, m)
               } else if (cmd.private && m.isGroup) {
                  client.reply(m.chat, global.status.private, m)
               } else {
                  const pluginParams = { client, args, text, isPrefix: prefix, prefixes, command, groupMetadata, participants, users, chats, groupSet, setting, isOwner, isAdmin, isBotAdmin, plugins: Object.fromEntries(Object.entries(plugins).filter(([name, _]) => !setting.pluginDisable.includes(name))), Config, blockList, ctx: context, store, system, connector, Utils }

                  if (limitCost > 0) {
                     const reservation = { cost: limitCost, committed: false }
                     users.limit -= limitCost

                     pluginParams.limitter = () => { reservation.committed = true }

                     cmd.async(m, pluginParams)
                        .catch(e => {
                           console.error(e)
                           client.reply(m.chat, global.status.error, m)
                        })
                        .finally(() => {
                           if (!reservation.committed) users.limit += reservation.cost // rollback kalau tidak commit
                        })
                  } else {
                     cmd.async(m, pluginParams)
                  }
               }
            }
         }
      } else {
         const excluded = ['anti_link', 'anti_tagall', 'anti_virtex', 'filter']

         const is_events = Object.fromEntries(Object.entries(plugins).filter(([name, prop]) => !prop.run.usage))
         for (const [pluginPath, pluginData] of Object.entries(is_events)) {
            const name = path.basename(pluginPath, '.js')
            const event = pluginData.run

            if ((m.fromMe && m.isBot) || /broadcast|newsletter/.test(m.chat) || /pollUpdate/.test(m.mtype)) continue
            if (!m.isGroup && Config.blocks.some(no => m.sender.startsWith(no))) return client.updateBlockStatus(m.sender, 'block')
            if (setting.self && !excluded.includes(event.pluginName) && !isOwner && !m.fromMe) continue

            if (!excluded.includes(name) && users && (users.banned || new Date - users.ban_temporary < Config.timeout)) continue

            if (!excluded.includes(name) && groupSet && groupSet.mute) continue

            if (!m.isGroup && !['auto_download'].includes(name) && chats && !isPrem && !users.banned && new Date() * 1 - chats.lastchat < Config.timeout) continue

            if (!m.isGroup && setting.groupmode && !['system_ev', 'auto_download'].includes(name) && !isPrem) continue
            if (setting.antispam && isSpam && /(NOTIFY)/.test(isSpam.state)) {
               client.reply(m.chat, Utils.texted('bold', `⚠️ ${isSpam.msg}`), m)
               return
            }

            if (setting.antispam && isSpam && /HOLD/.test(isSpam.state)) continue
            if (event.error) continue
            if (event.owner && !isOwner) continue
            if (event.group && !m.isGroup) continue

            if (event.limit && !event.game && users.limit < 1 && body && Utils.generateLink(body) && Utils.generateLink(body).some(v => Utils.socmed(v))) return client.reply(m.chat, `⚠️ You reached the limit and will be reset at 00.00\n\nTo get more limits upgrade to premium plan.`, m).then(() => {
               users.premium = false
               users.expired = 0
            })

            if (event.botAdmin && !isBotAdmin) continue
            if (event.admin && !isAdmin) continue
            if (event.private && m.isGroup) continue
            if (event.download && body && Utils.socmed(body) && !setting.autodownload && Utils.generateLink(body) && Utils.generateLink(body).some(v => Utils.socmed(v))) continue

            const limitter = event.limit ? () => users.limit -= 1 : () => { }
            event.async(m, { client, body, prefixes, groupMetadata, participants, users, chats, groupSet, setting, isOwner, isAdmin, isBotAdmin, plugins: Object.fromEntries(Object.entries(plugins).filter(([name, _]) => !setting.pluginDisable.includes(name))), Config, blockList, ctx: context, store, system, connector, Utils, limitter }).catch(e => {
               console.error(e)
               client.reply(m.chat, global.status.error, m)
            })
         }
      }
   } catch (e) {
      console.error('\x1b[1;91m[HANDLER]:\x1b[0m', e)
   }
}