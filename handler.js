const cron = require('node-cron'),
   fs = require('fs'),
   FormData = require('form-data'),
   axios = require('axios'),
   component = new(require('@neoxr/neoxr-js')),
   { execSync } = require('child_process'),
   { Function: Func, Logs, Scraper } = new(require('@neoxr/neoxr-js'))
require('./lib/system/functions')
const moment = require('moment-timezone')
moment.tz.setDefault(global.timezone).locale('id')
module.exports = async (client, m) => {
   try {
      require('./lib/system/schema')(m)
      const isOwner = [global.owner, ...global.db.setting.owners].map(v => v + '@s.whatsapp.net').includes(m.sender)
      const groupMetadata = m.isGroup ? await client.groupMetadata(m.chat) : {}
      const participants = m.isGroup ? groupMetadata.participants : [] || []
      const adminList = m.isGroup ? await client.groupAdmin(m.chat) : [] || []
      const isAdmin = m.isGroup ? adminList.includes(m.sender) : false
      const isBotAdmin = m.isGroup ? adminList.includes((client.user.id.split`:` [0]) + '@s.whatsapp.net') : false
      const blockList = typeof await (await client.fetchBlocklist()) != 'undefined' ? await (await client.fetchBlocklist()) : []
      const groupSet = global.db.groups.find(v => v.jid == m.chat)
      chats = global.db.chats.find(v => v.jid == m.chat)
      users = global.db.users.find(v => v.jid == m.sender)
      setting = global.db.setting
      const body = typeof m.text == 'string' ? m.text : false
      if (!setting.online) await client.sendPresenceUpdate('unavailable', m.chat)
      if (setting.online) await client.sendPresenceUpdate('available', m.chat)
      if (setting.debug && !m.fromMe && isOwner) client.reply(m.chat, Func.jsonFormat(m), m)
      if (m.chat.endsWith('broadcast') && setting.viewstory) await client.readMessages([m.key])
      if (m.isGroup) groupSet.activity = new Date() * 1
      if (users) users.lastseen = new Date() * 1
      if (chats) {
         chats.lastchat = new Date() * 1
         chats.chat += 1
      }
      cron.schedule('*/25 * * * *', () => {
         process.send('reset')
      }, {
         scheduled: true,
         timezone: global.timezone
      })
      const getPrefix = body ? body.charAt(0) : ''
      const prefix = (setting.multiprefix ? setting.prefix.includes(getPrefix) : setting.onlyprefix == getPrefix) ? getPrefix : undefined
      Logs(client, m, prefix)
      if (m.isBot || m.chat.endsWith('broadcast')) return
      const commands = neoxr.plugins.filter(v => v.usage).map(v => v.usage).concat(neoxr.plugins.filter(v => v.hidden).map(v => v.hidden)).flat(Infinity)
      const args = body && body.replace(prefix, '').split` `.filter(v => v)
      const command = args && args.shift().toLowerCase()
      const clean = body && body.replace(prefix, '').trim().split` `.slice(1)
      const text = clean ? clean.join` ` : undefined
      const prefixes = global.db.setting.multiprefix ? global.db.setting.prefix : [global.db.setting.onlyprefix]
      if (body && prefix && commands.includes(command) || body && !prefix && commands.includes(command) && setting.noprefix) {
         try {
            if (new Date() * 1 - chats.command > (global.cooldown * 1000)) {
               chats.command = new Date() * 1
            } else {
               if (!m.fromMe) return
            }
         } catch (e) {
            global.db.chats.push({
               jid: m.chat,
               chat: 1,
               lastchat: new Date() * 1,
               command: new Date() * 1
            })
         }
         let matcher = Func.matcher(command, commands).filter(v => v.accuracy >= 60)
         if (!commands.includes(command) && matcher.length > 0 && !setting.self) return client.reply(m.chat, `🚩 Command you are using is wrong, try the following recommendations :\n\n${matcher.map(v => '➠ *' + (prefix ? prefix : '') + v.string + '* (' + v.accuracy + '%)').join('\n')}`, m)       
         if (!m.isGroup && global.blocks.some(no => m.sender.startsWith(no))) return client.updateBlockStatus(m.sender, 'block')
         neoxr.plugins.map(async cmd => {
            const turn = cmd.usage instanceof Array ? cmd.usage.includes(command) : cmd.usage instanceof String ? cmd.usage == command : false
            const turn_hidden = cmd.hidden instanceof Array ? cmd.hidden.includes(command) : cmd.hidden instanceof String ? cmd.hidden == command : false
            const name = cmd.pluginName
            if (!turn && !turn_hidden) return
            if (setting.self && !isOwner && !m.fromMe) return
            if (cmd.owner && !isOwner) return client.reply(m.chat, global.status.owner, m)
            if (cmd.group && !m.isGroup) {
               client.reply(m.chat, global.status.group, m)
               return
            } else if (cmd.botAdmin && !isBotAdmin) {
               client.reply(m.chat, global.status.botAdmin, m)
               return
            } else if (cmd.admin && !isAdmin) {
               client.reply(m.chat, global.status.admin, m)
               return
            }
            if (cmd.private && m.isGroup) return client.reply(m.chat, global.status.private, m)
            cmd.async(m, {
               client,
               args,
               text,
               prefix: prefix ? prefix : '',
               command,
               participants,
               blockList,
               isOwner,
               isAdmin,
               isBotAdmin,
               Func,
               Scraper,
               execSync,
               component
            })
         })
      } else {
         neoxr.plugins.filter(v => !v.usage).map(async event => {
            let name = event.pluginName
            if (!m.isGroup && global.blocks.some(no => m.sender.startsWith(no))) return client.updateBlockStatus(m.sender, 'block')
            if (setting.self && !['chatbot', 'system_ev'].includes(name) && !isOwner && !m.fromMe) return
            if (event.owner && !isOwner) return
            if (event.group && !m.isGroup) return
            if (event.botAdmin && !isBotAdmin) return
            if (event.admin && !isAdmin) return
            if (event.private && m.isGroup) return
            event.async(m, {
               client,
               body,
               participants,
               prefixes,
               isOwner,
               isAdmin,
               isBotAdmin,
               users,
               chats,
               groupSet,
               groupMetadata,
               setting,
               Func,
               Scraper
            })
         })
      }
   } catch (e) {
      console.log(e)
      if (!m.fromMe) return m.reply(Func.jsonFormat(new Error('neoxr-bot encountered an error :' + e)))
   }
}

Func.reload(require.resolve(__filename))