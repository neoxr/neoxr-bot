import { Utils, Scraper, Cooldown, Spam, Config } from '@neoxr/wb'
import cron from 'node-cron'
import path from 'path'
const cooldown = new Cooldown(Config.cooldown)
const spam = new Spam({
   RESET_TIMER: Config.cooldown,
   HOLD_TIMER: Config.timeout,
   PERMANENT_THRESHOLD: Config.permanent_threshold,
   NOTIFY_THRESHOLD: Config.notify_threshold,
   BANNED_THRESHOLD: Config.banned_threshold
})
import schema from './lib/schema.js'

export default async (client, ctx) => {
   let { store, m, body, prefix, plugins, commands, args, command, text, prefixes, core, system } = ctx
   try {
      if (m.sender && m.sender.endsWith('lid')) m.sender = client.getRealJid(m.sender) || m.sender
      const [groupMetadata, blockList] = await Promise.all([
         m.isGroup ? client.resolveGroupMetadata(m.chat) : Promise.resolve({}),
         client.fetchBlocklist().catch(() => [])
      ])

      schema(m, Config)

      let groupSet = global.db.groups.find(v => v.jid === m.chat)
      let chats = global.db.chats.find(v => v.jid === m.chat)
      let users = global.db.users.find(v => v.jid === m.sender)
      let setting = global.db.setting
      let isOwner = [client.decodeJid(client.user.id).replace(/@.+/, ''), Config.owner, ...setting.owners].map(v => v + '@s.whatsapp.net').includes(m.sender)
      let isPrem = users && users.premium || isOwner
      let participants = m.isGroup ? groupMetadata ? client.lidParser(groupMetadata.participants) : [] : [] || []
      const admins = m.isGroup ? client.getAdmin(participants) : []
      const isAdmin = m.isGroup ? admins.includes(m.sender) : false
      const isBotAdmin = m.isGroup ? admins.includes((client.user.id.split`:`[0]) + '@s.whatsapp.net') : false

      const isSpam = spam.detection(client, m, {
         prefix, command, commands, users, cooldown,
         show: 'all', // options: 'all' | 'command-only' | 'message-only' | 'spam-only'| 'none'
         banned_times: users?.ban_times,
         exception: isOwner || isPrem
      })

      plugins = Object.fromEntries(Object.entries(plugins).filter(([dir, _]) => !setting.pluginDisable.includes(path.basename(dir, '.js'))))

      if (!setting.online) client.sendPresenceUpdate('unavailable', m.chat)
      if (setting.online) {
         client.sendPresenceUpdate('available', m.chat)
         client.readMessages([m.key])
      }
      if (m.isGroup && !isBotAdmin) {
         groupSet.localonly = false
      }
      if (!users || typeof users.limit === undefined) return global.db.users.push({
         jid: m.sender,
         lid: m.sender?.endsWith('lid') ? m.sender : null,
         banned: false,
         limit: Config.limit,
         hit: 0,
         spam: 0
      })
      if (!setting.multiprefix) setting.noprefix = false
      if (setting.debug && !m.fromMe && isOwner) client.reply(m.chat, Utils.jsonFormat(m), m)

      if (m.isGroup) groupSet.activity = new Date() * 1
      if (users) {
         if (!users.lid) {
            const { lid } = await client.getUserId(m.sender)
            if (lid) users.lid = lid
         }
         users.name = m.pushName
         users.lastseen = new Date() * 1
      }
      if (chats) {
         chats.chat += 1
         chats.lastseen = new Date * 1
      }
      if (m.isGroup && !m.isBot && users && users.afk > -1) {
         client.reply(m.chat, `You are back online after being offline for : ${Utils.texted('bold', Utils.toTime(new Date - users.afk))}\n\n• ${Utils.texted('bold', 'Reason')}: ${users.afkReason ? users.afkReason : '-'}`, m)
         users.afk = -1
         users.afkReason = ''
         users.afkObj = {}
      }
      cron.schedule('00 00 * * *', () => {
         setting.lastReset = new Date * 1
         global.db.users.filter(v => v.limit < Config.limit && !v.premium).map(v => v.limit = Config.limit)
         Object.entries(global.db.statistic).map(([_, prop]) => prop.today = 0)
      }, {
         scheduled: true,
         timezone: process.env.TZ
      })
      if (m.isGroup && !m.fromMe) {
         let now = new Date() * 1
         if (!groupSet.member[m.sender]) {
            groupSet.member[m.sender] = {
               lastseen: now,
               warning: 0
            }
         } else {
            groupSet.member[m.sender].lastseen = now
         }
      }
      // if (setting.antispam && isSpam && /(BANNED|NOTIFY|TEMPORARY)/.test(isSpam.state)) return client.reply(m.chat, Utils.texted('bold', `🚩 ${isSpam.msg}`), m)
      // if (setting.antispam && isSpam && /HOLD/.test(isSpam.state)) return
      if (body && !setting.self && core.prefix != setting.onlyprefix && commands.includes(core.command) && !setting.multiprefix && !Config.evaluate_chars.includes(core.command)) return client.reply(m.chat, `🚩 *Incorrect prefix!*, this bot uses prefix : *[ ${setting.onlyprefix} ]*\n\n➠ ${setting.onlyprefix + core.command} ${text || ''}`, m)
      const matcher = Utils.matcher(command, commands).filter(v => v.accuracy >= 60)
      if (prefix && !commands.includes(command) && matcher.length > 0 && !setting.self) {
         if (!m.isGroup || (m.isGroup && !groupSet.mute)) return client.reply(m.chat, `🚩 Command you are using is wrong, try the following recommendations :\n\n${matcher.map(v => '➠ *' + (prefix ? prefix : '') + v.string + '* (' + v.accuracy + '%)').join('\n')}`, m)
      }

      if (
         body && prefix && commands.includes(command) && setting.multiprefix && setting.prefix.includes(prefix) ||
         body && !prefix && commands.includes(command) && setting.noprefix ||
         body && prefix && commands.includes(command) && !setting.multiprefix && setting.onlyprefix === prefix ||
         body && !prefix && commands.includes(command) && Config.evaluate_chars.includes(command)
      ) {
         if (setting.error.includes(command)) return client.reply(m.chat, Utils.texted('bold', `🚩 Command _${(prefix ? prefix : '') + command}_ disabled.`), m)
         if (!m.isGroup && Config.blocks.some(no => m.sender?.startsWith(no))) return client.updateBlockStatus(m.sender, 'block')
         if (commands.includes(command)) {
            users.hit += 1
            users.usebot = new Date() * 1
            Utils.hitstat(command, m.sender)
         }
         const is_commands = Object.fromEntries(Object.entries(plugins).filter(([name, prop]) => prop.run.usage))
         for (let pluginPath in is_commands) {
            const name = path.basename(pluginPath, '.js')
            const cmd = is_commands[pluginPath].run
            const turn = cmd.usage instanceof Array ? cmd.usage.includes(command) : cmd.usage instanceof String ? cmd.usage == command : false
            const turn_hidden = cmd.hidden instanceof Array ? cmd.hidden.includes(command) : cmd.hidden instanceof String ? cmd.hidden == command : false
            if (!turn && !turn_hidden) continue
            if (m.isBot || m.chat.endsWith('broadcast') || /edit/.test(m.mtype)) continue
            if (setting.self && !isOwner && !m.fromMe) continue
            if (!m.isGroup && !['owner'].includes(name) && chats && !isPrem && !users.banned && new Date() * 1 - chats.lastchat < Config.timeout) continue
            if (!m.isGroup && !['owner', 'menfess', 'scan', 'verify', 'payment', 'premium'].includes(name) && chats && !isPrem && !users.banned && setting.groupmode) {
               client.sendMessageModify(m.chat, `⚠️ Using bot in private chat only for premium user, want to upgrade to premium plan ? send *${prefixes[0]}premium* to see benefit and prices.`, m, {
                  largeThumb: true,
                  thumbnail: 'https://telegra.ph/file/0b32e0a0bb3b81fef9838.jpg',
                  url: setting.link
               }).then(() => chats.lastchat = new Date() * 1)
               continue
            }
            if (!['me', 'owner', 'exec'].includes(name) && users && (users.banned || new Date - users.ban_temporary < Config.timeout)) continue
            if (m.isGroup && !['activation', 'groupinfo'].includes(name) && groupSet.mute) continue
            if (cmd.owner && !isOwner) {
               client.reply(m.chat, global.status.owner, m)
               continue
            }
            if (cmd.restrict && !isPrem && !isOwner && text && new RegExp('\\b' + setting.toxic.join('\\b|\\b') + '\\b').test(text.toLowerCase())) {
               client.reply(m.chat, `⚠️ You violated the *Terms & Conditions* of using bots by using blacklisted keywords, as a penalty for your violation being blocked and banned.`, m).then(() => {
                  users.banned = true
                  client.updateBlockStatus(m.sender, 'block')
               })
               continue
            }
            if (setting.antispam && isSpam && /(BANNED|NOTIFY|TEMPORARY)/.test(isSpam.state)) {
               client.reply(m.chat, Utils.texted('bold', `🚩 ${isSpam.msg}`), m)
               continue
            }
            if (setting.antispam && isSpam && /HOLD/.test(isSpam.state)) continue
            if (cmd.premium && !isPrem) {
               client.reply(m.chat, global.status.premium, m)
               continue
            }
            if (cmd.limit && users.limit < 1) {
               client.reply(m.chat, `⚠️ You reached the limit and will be reset at 00.00\n\nTo get more limits upgrade to premium plans.`, m).then(() => users.premium = false)
               continue
            }
            if (cmd.limit && users.limit > 0) {
               const limit = cmd.limit.constructor.name == 'Boolean' ? 1 : cmd.limit
               if (users.limit >= limit) {
                  users.limit -= limit
               } else {
                  client.reply(m.chat, Utils.texted('bold', `⚠️ Your limit is not enough to use this feature.`), m)
                  continue
               }
            }
            if (cmd.group && !m.isGroup) {
               client.reply(m.chat, global.status.group, m)
               continue
            } else if (cmd.botAdmin && !isBotAdmin) {
               client.reply(m.chat, global.status.botAdmin, m)
               continue
            } else if (cmd.admin && !isAdmin) {
               client.reply(m.chat, global.status.admin, m)
               continue
            }
            if (cmd.private && m.isGroup) {
               client.reply(m.chat, global.status.private, m)
               continue
            }
            cmd.async(m, { client, args, text, isPrefix: prefix, prefixes, command, groupMetadata, participants, users, chats, groupSet, setting, isOwner, isAdmin, isBotAdmin, plugins: Object.fromEntries(Object.entries(plugins).filter(([name, _]) => !setting.pluginDisable.includes(name))), blockList, Config, ctx, store, system, Utils, Scraper })
            break
         }
      } else {
         const is_events = Object.fromEntries(Object.entries(plugins).filter(([name, prop]) => !prop.run.usage))
         for (let pluginPath in is_events) {
            const name = path.basename(pluginPath, '.js')
            const event = is_events[pluginPath].run
            if ((m.fromMe && m.isBot) || m.chat.endsWith('broadcast') || /pollUpdate/.test(m.mtype)) continue
            if (!m.isGroup && Config.blocks.some(no => m.sender.startsWith(no))) return client.updateBlockStatus(m.sender, 'block')
            if (setting.self && !['menfess_ev', 'anti_link', 'anti_tagall', 'anti_virtex', 'filter'].includes(event.pluginName) && !isOwner && !m.fromMe) continue
            if (!['anti_link', 'anti_tagall', 'anti_virtex', 'filter'].includes(name) && users && (users.banned || new Date - users.ban_temporary < Config.timeout)) continue
            if (!['anti_link', 'anti_tagall', 'anti_virtex', 'filter'].includes(name) && groupSet && groupSet.mute) continue
            if (!m.isGroup && !['menfess_ev', 'chatbot', 'auto_download'].includes(name) && chats && !isPrem && !users.banned && new Date() * 1 - chats.lastchat < Config.timeout) continue
            if (!m.isGroup && setting.groupmode && !['system_ev', 'menfess_ev', 'chatbot', 'auto_download'].includes(name) && !isPrem) return client.sendMessageModify(m.chat, `⚠️ Using bot in private chat only for premium user, want to upgrade to premium plan ? send *${prefixes[0]}premium* to see benefit and prices.`, m, {
               largeThumb: true,
               thumbnail: await Utils.fetchAsBuffer('https://telegra.ph/file/0b32e0a0bb3b81fef9838.jpg'),
               url: setting.link
            }).then(() => chats.lastchat = new Date() * 1)
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
            event.async(m, { client, body, prefixes, groupMetadata, participants, users, chats, groupSet, setting, isOwner, isAdmin, isBotAdmin, plugins: Object.fromEntries(Object.entries(plugins).filter(([name, _]) => !setting.pluginDisable.includes(name))), blockList, Config, ctx, store, system, Utils, Scraper })
         }
      }
   } catch (e) {
      Utils.printError(e)
   }
}