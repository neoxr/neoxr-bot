import { Utils, Cooldown, Spam, Config } from '@neoxr/telegram'
import path from 'path'

const cooldown = new Cooldown(Config.cooldown)
const spam = new Spam({
   RESET_TIMER: Config.cooldown,
   HOLD_TIMER: Config.timeout,
   HOLD_THRESHOLD: Config.hold_threshold,
   PERMANENT_THRESHOLD: Config.permanent_threshold,
   NOTIFY_THRESHOLD: Config.notify_threshold,
   BANNED_THRESHOLD: Config.banned_threshold
})

import { models } from './lib/models.js'
import schema from './lib/schema.js'

let pluginCache = null
const getPluginCache = (plugins = {}, disabled = []) => {
   const disabledKey = [...disabled].sort().join('|')
   const entries = Object.entries(plugins || {})

   let isStale = !pluginCache ||
      pluginCache.source !== plugins ||
      pluginCache.disabledKey !== disabledKey ||
      pluginCache.entriesLength !== entries.length

   if (!isStale && pluginCache.lastEntries) {
      for (let i = 0; i < entries.length; i++) {
         if (entries[i][1] !== pluginCache.lastEntries[i][1]) {
            isStale = true
            break
         }
      }
   }

   if (!isStale) return pluginCache

   const disabledSet = new Set(disabled)
   const enabledMap = new Map()
   const commandMap = new Map()
   const eventMap = new Map()

   for (const [dir, prop] of entries) {
      const name = path.basename(dir, '.js')
      if (disabledSet.has(name)) continue

      enabledMap.set(dir, prop)

      const cmd = prop?.run
      if (!cmd) continue

      if (cmd.usage) {
         const usages = Array.isArray(cmd.usage) ? cmd.usage : (typeof cmd.usage === 'string' ? [cmd.usage] : [])
         const hiddens = Array.isArray(cmd.hidden) ? cmd.hidden : (typeof cmd.hidden === 'string' ? [cmd.hidden] : [])
         const triggers = [...usages, ...hiddens]

         for (const trigger of triggers) {
            commandMap.set(trigger, { pluginPath: dir, pluginData: prop, name })
         }
      } else {
         eventMap.set(dir, prop)
      }
   }

   pluginCache = {
      source: plugins,
      disabledKey,
      entriesLength: entries.length,
      lastEntries: entries,
      enabled: enabledMap,
      commands: commandMap,
      events: eventMap
   }

   return pluginCache
}

const getLightQuoted = message => {
   if (!message) return null

   return {
      chat: message.chat,
      sender: message.sender.id,
      mtype: message.mtype,
      text: message.text || message.body || message.caption || '',
      key: message.key,
      id: message.id
   }
}

if (!global.typo) global.typo = new Map()

const adminCache = new Map()
global.adminCache = adminCache
const CACHE_TTL = 60 * 1000

async function getGroupAdadmins(client, chatId, force = false) {
   if (!force) {
      const cached = adminCache.get(chatId)
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
         return cached.admins
      }
   }

   try {
      const list = await client.getChatAdministrators(chatId)
      const adminIds = list.map(admin => admin.user.id)
      adminCache.set(chatId, { admins: adminIds, timestamp: Date.now() })
      return adminIds
   } catch (error) {
      console.error('Failed to get admin list:', error)
      return []
   }
}

export default async (client, ctx) => {
   let { m, source, body, prefix, plugins, commands, args, command, text, prefixes, core, system, connector } = ctx
   try {
      plugins = plugins || connector?.plugins || client?.plugins || {}
      commands = commands || connector?.commands || client?.commands || []

      let botDb = global.db

      if (connector?.isChildInstance) {
         try {
            const botId = String(connector.botInfo?.id || connector.getBotIdentifier())
            let botEntry = global.db.bots.find(b => String(b.id) === botId)
            if (!botEntry) {
               botEntry = global.db.bots.find(b => String(b.username || '').replace(/^@/, '') === botId)
            }

            if (botEntry) {
               botDb = botEntry.data
            }
         } catch (err) {
            console.log('DEBUG ERROR in childbot handler:', err)
         }
      }

      schema(m, botDb)

      if (m.chat && ['promote', 'demote'].includes(command)) {
         adminCache.delete(m.chat)
      }

      const senderId = String(m.sender.id)
      const senderUsername = m.sender.username ? m.sender.username.toLowerCase().replace(/^@/, '') : ''

      const groupSet = botDb.groups?.get ? botDb.groups.get(m.chat) : null
      const chats = botDb.chats?.get ? botDb.chats.get(m.chat) : null
      const users = botDb.users?.get ? botDb.users.get(m.sender.id) : null
      const setting = botDb.setting || connector.setting || global.db.setting

      const operatorList = [
         Config.operator,
         ...(Array.isArray(setting.operators) ? setting.operators : [setting.operators])
      ].filter(Boolean).map(v => String(v).trim().toLowerCase().replace(/^@/, ''))

      const isOperator = operatorList.includes(senderId) || (Boolean(senderUsername) && operatorList.includes(senderUsername))

      const ownerList = [
         ...(Array.isArray(setting.owners) ? setting.owners : [setting.owners])
      ].filter(Boolean).map(v => String(v).trim().toLowerCase().replace(/^@/, ''))

      const isOwner = isOperator || ownerList.includes(senderId) || (Boolean(senderUsername) && ownerList.includes(senderUsername))

      const isPrem = Boolean(users?.premium || isOperator || isOwner)
      const groupAdmins = m.isGroup ? await getGroupAdadmins(client, m.chat) : []
      const isBotAdmin = groupAdmins.includes(client.botInfo?.id)
      const isAdmin = groupAdmins.includes(m.sender.id)

      const isSpam = spam.detection(client, m, {
         prefix, command, commands, users, cooldown,
         show: 'all',
         banned_times: users?.ban_times,
         exception: isOwner || isPrem
      })

      const pluginState = getPluginCache(plugins, setting.pluginDisable || [])
      const { enabled: enabledPlugins, commands: commandPluginMap, events: eventPluginMap } = pluginState
      plugins = enabledPlugins

      const isButtonClicked = source === 'callback_query' || m.mtype === 'callbackQuery'

      if (isButtonClicked) {
         const tg = client.telegram
         if (tg && m.chat && m.id) {
            await tg.editMessageReplyMarkup(m.chat, m.id, undefined, { inline_keyboard: [] }).catch(() => { })
         }

         if (global.typo.has(m.sender.id)) {
            clearTimeout(global.typo.get(m.sender.id).timeout)
            global.typo.delete(m.sender.id)
         }
      }

      if (global.typo.has(m.sender.id) && (!prefix || !commands.includes(command)) && body && /^\d+$/.test(body.trim())) {
         const typoData = global.typo.get(m.sender.id)
         const selectedIndex = parseInt(body.trim()) - 1

         if (selectedIndex >= 0 && selectedIndex < typoData.commands.length) {
            clearTimeout(typoData.timeout)

            if (typoData.msgId) {
               const tg = client.telegram
               tg?.editMessageReplyMarkup(m.chat, typoData.msgId, undefined, { inline_keyboard: [] }).catch(() => { })
            }

            command = typoData.commands[selectedIndex]
            prefix = typoData.prefix || '.'
            text = typoData.text || ''
            args = typoData.args || []
            body = prefix + command + (text ? ' ' + text : '')

            if (typoData.quoted) {
               m.quoted = typoData.quoted
            }

            global.typo.delete(m.sender.id)
         }
      }

      const matcher = Utils.matcher(command, commands).filter(v => v.accuracy >= 60)

      if (prefix && !commands.includes(command) && matcher.length > 0 && !setting.self) {
         if (!m.isGroup || (m.isGroup && !groupSet?.mute)) {
            const tg = client.telegram

            if (global.typo.has(m.sender.id)) {
               const oldTypo = global.typo.get(m.sender.id)
               clearTimeout(oldTypo.timeout)
               if (oldTypo.msgId && tg) {
                  tg.editMessageReplyMarkup(m.chat, oldTypo.msgId, undefined, { inline_keyboard: [] }).catch(() => { })
               }
            }

            let mime = (m.quoted ? m.quoted.mtype : m.mtype)
            let isMedia = /image|video|sticker|audio|document/.test(mime)
            const suggestedCommands = matcher.slice(0, 3).map(v => v.string)

            let caption = `🚩 <b>Command not found.</b> Did you mean :\n\n`
            caption += suggestedCommands.map((v, i) =>
               `<b>${i + 1}.</b> ${prefix + v} (${matcher[i].accuracy}%)`
            ).join('\n')
            caption += `\n\n<blockquote>Click button below to execute. (Expires in 3 minutes)</blockquote>`

            const buttons = suggestedCommands.map(cmd => [
               { text: `${prefix + cmd}`, callback_data: `${prefix + cmd}` }
            ])

            const sentMsg = await client.replyButton(m.chat, caption, buttons, m, { parse_mode: 'HTML' })

            if (sentMsg?.message_id) {
               const timeout = setTimeout(async () => {
                  global.typo.delete(m.sender.id)
                  if (tg) {
                     await tg.editMessageReplyMarkup(m.chat, sentMsg.message_id, undefined, { inline_keyboard: [] }).catch(() => { })
                  }
               }, 180000)

               global.typo.set(m.sender.id, {
                  commands: suggestedCommands,
                  prefix: prefix,
                  text: text,
                  args: args,
                  msgId: sentMsg.message_id,
                  quoted: getLightQuoted(m.quoted ? m.quoted : (isMedia ? m : null)),
                  timeout
               })
            }

            return sentMsg
         }
      }

      if (
         body && prefix && commands.includes(command) && setting.multiprefix && setting.prefix.includes(prefix) ||
         body && !prefix && commands.includes(command) && setting.noprefix ||
         body && prefix && commands.includes(command) && !setting.multiprefix && setting.onlyprefix === prefix ||
         body && !prefix && commands.includes(command) && Config.evaluate_chars.includes(command)
      ) {
         if (setting.error.includes(command)) return client.reply(m.chat, `🚩 Command _${(prefix ? prefix : '') + command}_ disabled.`, m)
         if (commands.includes(command) && users) {
            users.hit += 1
            users.usebot = new Date() * 1
            Utils.hitstat(botDb, command, m.sender.id)
         }

         const matchedCommand = commandPluginMap.get(command)
         if (matchedCommand) {
            const { pluginPath, pluginData, name } = matchedCommand
            const cmd = pluginData.run
            let allowed = true
            if (setting.self && !isOwner && !m.fromMe) allowed = false
            if (allowed && !m.isGroup && !['owner'].includes(name) && chats && !isPrem && !users?.banned && new Date() * 1 - chats.lastchat < Config.timeout) allowed = false
            if (allowed && !m.isGroup && !['owner', 'premium'].includes(name) && chats && !isPrem && !users?.banned && setting.groupmode) {
               allowed = false
            }
            if (allowed && !['me', 'owner', 'exec'].includes(name) && users && (users.banned || new Date - users.ban_temporary < Config.timeout)) {
               client.reply(m.chat, `⚠️ ${isSpam.msg}`, m)
               allowed = false
            }
            if (allowed && m.isGroup && !['groupinfo'].includes(name) && groupSet?.mute) allowed = false
            if (allowed && cmd.owner && !isOwner) {
               client.reply(m.chat, global.status.owner, m)
               allowed = false
            }
            if (allowed && cmd.restrict && !isPrem && !isOwner && text && new RegExp('\\b' + setting.toxic.join('\\b|\\b') + '\\b').test(text.toLowerCase())) {
               client.reply(m.chat, `⚠️ You violated the *Terms & Conditions* of using bots by using blacklisted keywords, as a penalty for your violation being blocked and banned.`, m).then(() => {
                  if (users) users.banned = true
               })
               allowed = false
            }
            if (allowed && setting.antispam && isSpam && /(BANNED|NOTIFY)/.test(isSpam.state)) {
               client.reply(m.chat, `⚠️ ${isSpam.msg}`, m)
               allowed = false
            }
            if (allowed && setting.antispam && isSpam && /HOLD/.test(isSpam.state)) allowed = false
            if (allowed && cmd.premium && !isPrem) {
               client.reply(m.chat, global.status.premium, m)
               allowed = false
            }
            if (allowed && cmd.limit && users && users.limit < 1) {
               client.reply(m.chat, `⚠️ You reached the limit and will be reset at 00.00\n\nTo get more limits upgrade to premium plans.`, m).then(() => users.premium = false)
               allowed = false
            }
            if (allowed && cmd.limit && users && users.limit > 0) {
               const limit = cmd.limit.constructor.name == 'Boolean' ? 1 : cmd.limit
               if (users.limit >= limit) {
                  users.limit -= limit
               } else {
                  client.reply(m.chat, `⚠️ Your limit is not enough to use this feature.`, m)
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
                  await cmd.async(m, { client, args, text, isPrefix: prefix, prefixes, command, users, chats, groupSet, setting, plugins, connector, Config, ctx, system, Utils, isOperator, isOwner, isPrem, db: botDb, refreshAdmins: () => adminCache.delete(m.chat) })
                  if (m.chat && ['promote', 'demote'].includes(command)) {
                     adminCache.delete(m.chat)
                  }
               }
            }
         }
      } else {
         for (const [pluginPath, pluginData] of eventPluginMap) {
            const name = path.basename(pluginPath, '.js')
            const event = pluginData.run
            const protector = ['anti_link', 'filter']
            if (setting.self && ![...protector].includes(event.pluginName) && !isOwner) continue
            if (!protector.includes(name) && users && (users.banned || new Date - users.ban_temporary < Config.timeout)) continue
            if (!protector.includes(name) && groupSet && groupSet.mute) continue
            if (!m.isGroup && !['auto_download'].includes(name) && chats && !isPrem && !users?.banned && new Date() * 1 - chats.lastchat < Config.timeout) continue
            if (!m.isGroup && setting.groupmode && !['system_ev', 'auto_download'].includes(name) && !isPrem) {
               continue
            }
            if (setting.antispam && isSpam && /(NOTIFY)/.test(isSpam.state)) {
               client.reply(m.chat, `⚠️ ${isSpam.msg}`, m)
               return
            }
            if (setting.antispam && isSpam && /HOLD/.test(isSpam.state)) continue
            if (event.error) continue
            if (event.owner && !isOwner) continue
            if (event.group && !m.isGroup) continue
            if (event.botAdmin && !isBotAdmin) continue
            if (event.admin && !isAdmin) continue
            if (event.private && m.isGroup) continue
            event.async(m, { client, body, prefixes, users, chats, groupSet, setting, plugins, connector, Config, ctx, system, Utils, isOperator, isOwner, isPrem, db: botDb, refreshAdmins: () => adminCache.delete(m.chat) })
         }
      }
   } catch (e) {
      Utils.printError(e)
   }
}