const moment = require('moment-timezone')
moment.tz.setDefault('Asia/Jakarta').locale('id')
module.exports = async (client, m) => {
   try {
      require('./system/database')(m)
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
      if (m.isGroup && groupSet.autoread) await client.readMessages([m.key])
      if (m.chat.endsWith('broadcast') && setting.viewstory) await client.readMessages([m.key])
      if (users) users.lastseen = new Date() * 1
      if (chats) {
         chats.lastseen = new Date() * 1
         chats.chat += 1
      }
      let getPrefix = body ? body.charAt(0) : ''
      let myPrefix = (setting.multiprefix ? setting.prefix.includes(getPrefix) : setting.onlyprefix == getPrefix) ? getPrefix : undefined
      require('./system/logs')(client, m, myPrefix)
      if (m.isBot || m.chat.endsWith('broadcast')) return
      if (body && body == myPrefix) {
         if (!isOwner) return
         let old = new Date()
         let banchat = setting.self ? true : false
         if (!banchat) {
            await client.reply(m.chat, Func.texted('bold', `Checking . . .`), m)
            return client.reply(m.chat, Func.texted('bold', `Response Speed: ${((new Date - old) * 1)}ms`), m)
         } else {
            await client.reply(m.chat, Func.texted('bold', `Checking . . .`), m)
            return client.reply(m.chat, Func.texted('bold', `Response Speed: ${((new Date - old) * 1)}ms (nonaktif)`), m)
         }
      }
      let isPrefix,
         isCommands = Func.arrayJoin(Object.values(Object.fromEntries(Object.entries(global.client.plugins).filter(([name, prop]) => prop.run.usage))).map(v => v.run.usage)).concat(Func.arrayJoin(Object.values(Object.fromEntries(Object.entries(global.client.plugins).filter(([name, prop]) => prop.run.hidden))).map(v => v.run.hidden)))
      if ((body && body.length != 1 && (isPrefix = (myPrefix || '')[0])) || body && isCommands.includes((body.split` ` [0]).toLowerCase())) {
         let args = body.replace(isPrefix, '').split` `.filter(v => v)
         let command = args.shift().toLowerCase()
         let start = body.replace(isPrefix, '')
         let clean = start.trim().split` `.slice(1)
         let text = clean.join` `
         let prefixes = global.db.setting.multiprefix ? global.db.setting.prefix : [global.db.setting.onlyprefix]
         const is_commands = Object.fromEntries(Object.entries(global.client.plugins).filter(([name, prop]) => prop.run.usage || prop.run.hidden))
         let commands = Func.arrayJoin(Object.values(is_commands).map(v => v.run.usage)).concat(Func.arrayJoin(Object.values(is_commands).map(v => v.run.hidden))).filter(v => v)
         let matcher = Func.matcher(command, commands).filter(v => v.accuracy >= 60)
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
               lastchat: 0,
               lastseen: new Date() * 1,
               command: new Date() * 1
            })
         }
         if (!commands.includes(command) && matcher.length > 0 && !setting.self) return client.reply(m.chat, `🚩 Command you are using is wrong, try the following recommendations :\n\n${matcher.map(v => '➠ *' + isPrefix + v.string + '* (' + v.accuracy + '%)').join('\n')}`, m)
         for (let name in is_commands) {
            let cmd = is_commands[name].run
            let turn = cmd.usage ? cmd.usage instanceof Array ? cmd.usage.includes(command) : cmd.usage instanceof String ? cmd.usage == command : false : false
            let turn_hidden = cmd.hidden ? cmd.hidden instanceof Array ? cmd.hidden.includes(command) : cmd.hidden instanceof String ? cmd.hidden == command : false : false
            if (body && global.evaluate_chars.some(v => body.startsWith(v)) && !body.startsWith(myPrefix)) return
            if (!turn && !turn_hidden) continue
            if (!m.isGroup && global.blocks.some(no => m.sender.startsWith(no))) return client.updateBlockStatus(m.sender, 'block')
            if (setting.self && !isOwner && !m.fromMe) return
            if (cmd.cache && cmd.location) {
               let file = require.resolve(cmd.location)
               Func.reload(file)
            }
            if (cmd.error) {
               client.reply(m.chat, global.status.errorF, m)
               continue
            }
            if (cmd.owner && !isOwner) {
               client.reply(m.chat, global.status.owner, m)
               continue
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
               continue
            }
            cmd.async(m, {
               client,
               args,
               text,
               isPrefix: isPrefix ? isPrefix : '',
               command,
               participants,
               blockList,
               isOwner,
               isAdmin,
               isBotAdmin
            })
            break
         }
      } else {
         let prefixes = setting.multiprefix ? setting.prefix : [setting.onlyprefix]
         const is_events = Object.fromEntries(Object.entries(global.client.plugins).filter(([name, prop]) => !prop.run.usage && !prop.run.hidden))
         for (let name in is_events) {
            let event = is_events[name].run
            if (event.cache && event.location) {
               let file = require.resolve(event.location)
               Func.reload(file)
            }
            if (!m.isGroup && global.blocks.some(no => m.sender.startsWith(no))) return client.updateBlockStatus(m.sender, 'block')
            if (setting.self && !['chatAI', 'exec', 'directly', 'anti_delete', 'viewonce'].includes(name) && !isOwner && !m.fromMe) continue
            if (!m.isGroup && ['chatAI'].includes(name) && !setting.chatbot && chats && new Date() * 1 - chats.lastchat < global.timer) continue
            if (event.cache && event.location) {
               let file = require.resolve(event.location)
               Func.reload(file)
            }
            if (event.error) continue
            if (event.owner && !isOwner) continue
            if (event.group && !m.isGroup) continue
            if (event.botAdmin && !isBotAdmin) continue
            if (event.admin && !isAdmin) continue
            if (event.private && m.isGroup) continue
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
               setting
            })
         }
      }
   } catch (e) {
      if (!m.fromMe) return m.reply(Func.jsonFormat(e))
   }
}

Func.reload(require.resolve(__filename))