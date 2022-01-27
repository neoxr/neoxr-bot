const moment = require('moment-timezone')
moment.tz.setDefault('Asia/Jakarta').locale('id')
module.exports = async (client, m, chatUpdate) => {
   try {
      require('./system/database')(m)
      const isOwner = [client.user.id, global.owner, ...global.db.setting.owners].map(v => v + '@s.whatsapp.net').includes(m.sender)
      const isPrem = (typeof global.users[m.sender] != 'undefined' && global.users[m.sender].premium) || isOwner
      const groupMetadata = m.isGroup ? await client.groupMetadata(m.chat) : {}
      const participants = m.isGroup ? groupMetadata.participants : [] || []
      const adminList = m.isGroup ? await client.groupAdmin(m.chat) : [] || []
      const isAdmin = m.isGroup ? adminList.includes(m.sender) : false
      const isBotAdmin = m.isGroup ? adminList.includes((client.user.id.split`:` [0]) + '@s.whatsapp.net') : false
      const groupSet = global.db.groups[m.chat],
         users = global.db.users[m.sender],
         chats = global.db.chats[m.chat]
      require('./system/exec')(client, m, isOwner)
      await client.sendReadReceipt(m.chat, m.isGroup ? m.sender : undefined, [m.id || m.key.id])
      if (m.fromMe && /audio|video|sticker|image|document/.test(m.mtype)) global.setting.uploadSize += m.msg.fileLength.low
      if (!m.fromMe && /audio|video|sticker|image|document/.test(m.mtype)) global.setting.receiveSize += m.msg.fileLength.low
      if (m.isGroup) groupSet.activity = new Date() * 1
      typeof users != 'undefined' ? users.lastseen = new Date() * 1 : require('./system/database')(m), typeof chats != 'undefined' ? chats.lastseen = new Date() * 1 : require('./system/database')(m), typeof chats != 'undefined' ? chats.chat += 1 : require('./system/database')(m)
      if (m.isGroup && !m.fromMe) {
         let now = new Date() * 1
         if (typeof groupSet.member[m.sender] == 'undefined') {
            groupSet.member[m.sender] = {
               lastseen: now,
               warning: 0,
               whitelist: false,
            }
         } else {
            groupSet.member[m.sender].lastseen = now
         }
      }
      if (m.msg.viewOnce) {
         let media = await client.downloadMediaMessage(m.msg)
         if (/image/.test(m.mtype)) {
            client.sendImage(m.chat, media, m.text != '' ? m.text : '© neoxr-bot', m)
         } else if (/video/.test(m.mtype)) {
            client.sendVideo(m.chat, media, m.text != '' ? m.text : '© neoxr-bot', m)
         }
      }
      if (m.isBot || m.chat.endsWith('broadcast') || users.banTemp != 0) return
      if (m.isGroup && !isBotAdmin && groupSet.localonly) groupSet.localonly = false
      if (m.isGroup && !isBotAdmin && groupSet.spamProtect) groupSet.spamProtect = false
      if (m.isGroup && !groupSet.stay && (new Date * 1) >= groupSet.expired && groupSet.expired != 0) {
         return client.reply(m.chat, Func.texted('italic', `The bot's active period in this group has expired, it's time for the bot to leave the group.`)).then(async () => {
            groupSet.expired = 0
            await Func.delay(2000).then(() => client.groupLeave(m.chat))
         })
      }
      if (!m.fromMe && (new Date * 1) >= users.expired && users.expired != 0 && users.premium) {
         return client.reply(m.sender, Func.texted('bold', `Your premium package has expired, thank you for buying premium.`), m).then(() => {
            users.expired = 0
            users.premium = false
         })
      }
      setInterval(async () => {
         let day = 86400000 * 1,
            now = new Date() * 1
         for (let jid in global.chats) {
            if (now - global.chats[jid].lastseen > day) delete global.chats[jid]
         }
         if (m.isGroup) {
            let member = participants.map(v => v.id)
            Object.entries(groupSet.member).map(([v, x]) => {
               if (!member.includes(v)) delete groupSet.member[v]
            })
         }
      }, 3000)
      let getPrefix = (typeof m.text != 'object') ? m.text.trim().split('\n')[0].split(' ')[0] : ''
      if (setting.multiprefix ? setting.prefix.includes(getPrefix.slice(0, 1)) : setting.onlyprefix == getPrefix.slice(0, 1)) {
         var myPrefix = getPrefix.slice(0, 1)
      }
      if (!/afk/.test(m.text) && m.isGroup) {
         if (users.afk > -1) {
            client.reply(m.chat, `You are back online, after being offline for ${Func.texted('bold', Func.toTime(new Date - users.afk))}\n\n• ${Func.texted('bold', 'Reason')} : ${users.afkReason ? users.afkReason : '-'}`, m)
            users.afk = -1
            users.afkReason = ''
         }
      }
      require('./system/logs')(client, m, myPrefix)
      if (!m.fromMe && setting.groupmode && !m.isGroup && !isOwner && !isPrem) {
         if (!users.whitelist) {
            return client.reply(m.chat, Func.texted('bold', `Bots can only be used in groups, sorry your number will be blocked`), m).then(async () => {
               await Func.delay(3000).then(async () => await client.updateBlockStatus(m.sender, 'block'))
            })
         }
      }
      if (typeof m.text != 'object' && m.text.startsWith(myPrefix)) {
         if (typeof users != 'undefined') users.point += Func.randomInt(100, 55000)
         users.hit += 1
         users.usebot = new Date() * 1
         if (!isOwner) {
            if (new Date() * 1 - chats.command > 5000) { // < 5s per-command
               chats.command = new Date() * 1
            } else {
               if (!m.fromMe) return
            }
         }
      }
      if (((m.isGroup && !groupSet.banned) || !m.isGroup) && !users.banned) {
         if (typeof m.text != 'object' && m.text == myPrefix) {
            if (m.isGroup && groupSet.mute) return
            let old = new Date()
            let banchat = setting.self ? true : false
            if (!banchat) {
               await client.reply(m.chat, Func.texted('bold', `Checking . . .`), m)
               return client.reply(m.chat, Func.texted('bold', `Response Speed : ${((new Date - old)*1)}ms`), m)
            } else {
               await client.reply(m.chat, Func.texted('bold', `Checking . . .`), m)
               return client.reply(m.chat, Func.texted('bold', `Response Speed : ${((new Date - old)*1)}ms (nonaktif)`), m)
            }
         }
      }
      if (typeof m.text != 'object' && !m.fromMe && m.isGroup && isBotAdmin && !isAdmin) {
         if (groupSet.nolink) {
            if (m.text.match(/(chat.whatsapp.com)/gi)) {
               client.sendFile(m.chat, require('fs').readFileSync('./media/audio/nani-meme-sound-effect.mp3'), '', '', m, {
                  ptt: true
               }).then(() => {
                  client.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
               })
            }
         }
         if (groupSet.novirtex) {
            if (m.text.match(/(৭৭৭৭৭৭৭৭|๒๒๒๒๒๒๒๒|๑๑๑๑๑๑๑๑|ดุท้่เึางืผิดุท้่เึางื)/gi) || m.text.length > 10000) {
               client.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
            }
         }
         if (groupSet.nobadword && !groupSet.member[m.sender].whitelist && !users.whitelist) {
            let txc = global.setting.toxic
            if ((new RegExp('\\b' + txc.join('\\b|\\b') + '\\b')).test(m.text.toLowerCase())) {
               var cBad = groupSet.member[m.sender].warning += 1
               var warning = groupSet.member[m.sender].warning
               if (warning > 4) {
                  client.reply(m.chat, Func.texted('bold', `You have over bad word, goodbye. :)`), m).then(() => {
                     client.groupParticipantsUpdate(m.chat, [m.sender], 'remove').then(() => {
                        groupSet.member[m.sender].warning = 0
                        client.sendFile(m.chat, require('fs').readFileSync('./media/audio/tmpq7mpzzl9.mp3'), '', '', m, {
                           ptt: true
                        })
                     })
                  })
               } else {
                  client.reply(m.chat, `❏  *W A R N I N G*\n\nYou got warning : [ ${warning} / 5 ]\n\nIf you get 5 warnings you will be kicked automatically from *${groupMetadata.subject}'s* Group.`, m).then(() => {
                     client.sendFile(m.chat, require('fs').readFileSync('./media/audio/meme-de-creditos-finales.mp3'), '', '', m, {
                        ptt: true
                     })
                  })
               }
            }
         }
      }
      let jids = [...new Set([...(m.mentionedJid || []), ...(m.quoted ? [m.quoted.sender] : [])])]
      for (let jid of jids) {
         let is_user = global.users[jid]
         if (!is_user) continue
         let afkTime = is_user.afk
         if (!afkTime || afkTime < 0) continue
         let reason = is_user.afkReason || ''
         if (!m.fromMe) {
            client.reply(m.chat, `*Away From Keyboard* : @${jid.split('@')[0]}\n• *Reason* : ${reason ? reason : '-'}\n• *During* : [ ${Func.toTime(new Date - afkTime)} ]`, m)
         }
      }
      if (setting.self)
         if (!m.fromMe && !isOwner) return
      require('./system/customize')(client, m, setting, myPrefix, participants, isOwner, isPrem)
      if (typeof m.text !== 'object' && setting.errorCmd.includes(m.text.split` ` [0].substring(1).trim())) {
         return client.reply(m.chat, Func.texted('bold', `Command _${m.text.split` `[0].trim()}_ is disabled by Owner.`), m)
      }

      function join(arr) {
         var construct = []
         for (var i = 0; i < arr.length; i++) construct = construct.concat(arr[i])
         return construct
      }
      let cmds = global.client.commands != null ? Object.values(global.client.commands) : []
      let collect = []
      for (let i = 0; i < cmds.length; i++) collect.push(cmds[i].run.usage)
      if (typeof m.text !== 'object') {
         let thisCmd = m.text.split` ` [0].replace(myPrefix, '').trim()
         if (join(collect).includes(thisCmd)) {
            if (typeof global.statistic[thisCmd] == 'undefined') {
               global.statistic[thisCmd] = {
                  hitstat: 1,
                  lasthit: new Date * 1,
                  sender: m.sender.split`@` [0]
               }
            } else {
               if (!/bot|help|menu|stat|gc/.test(thisCmd)) {
                  global.statistic[thisCmd].hitstat += 1
                  global.statistic[thisCmd].lasthit = new Date * 1
                  global.statistic[thisCmd].sender = m.sender.split`@` [0]
               }
            }
         }
      }
      if (m.isGroup && groupSet.notify && !users.banned && !m.fromMe) {
         users.spam += 1
         let spam = users.spam
         if (spam >= 3) setTimeout(() => {
            users.spam = 0
         }, global.cooldown * 1000)
         if (m.isGroup && !isAdmin && isBotAdmin && !users.banned && groupSet.spamProtect && spam == 6) {
            return await client.groupSettingUpdate(m.chat, 'announcement').then(async () => {
               client.updateBlockStatus(m.sender, 'block')
               client.reply(m.chat, Func.texted('bold', `Spam protect, group closing automatically and will open after 1 minute.`), m)
               users.spam = 0
               setTimeout(() => {
                  client.groupSettingUpdate(m.chat, 'not_announcement')
               }, 60000)
            })
         } else
         if (m.isGroup && !isAdmin && !users.banned && spam == 6) {
            return client.reply(m.chat, `*Over spam, you got temporarily banned for 1 minute.*`, m).then(() => {
               users.banTemp = new Date() * 1
            })
         }
         if (m.isGroup && groupSet.notify) {
            if (spam == 5) return client.reply(m.chat, `*Hi @${m.sender.split('@')[0]} don't spam, cooldown 5 seconds.*`)
         }
      } else if (!m.isGroup && !m.fromMe && !users.banned) {
         users.spam += 1
         let spam = users.spam
         if (spam >= 2) setTimeout(() => {
            users.spam = 0
         }, global.cooldown * 1000)
         if (spam == 4) return client.reply(m.chat, Func.texted('bold', `Don't spam idiots!`), m)
         if (spam == 5) return client.reply(m.chat, Func.texted('bold', `Over spam you can't use this bot anymore, goodbye idiot.`), m).then(async () => {
            await Func.delay(1000).then(() => {
               users.banned = true
               client.updateBlockStatus(m.sender, 'block')
            })
         })
      }
      if (new Date() * 1 - users.banTemp > 60000) {
         users.banTemp = 0
      }
      let isPrefix
      if (typeof m.text != 'object' && m.text && m.text.length != 1 && (isPrefix = (myPrefix || '')[0])) {
         let args = m.text.replace(isPrefix, '').split` `.filter(v => v)
         let command = args.shift().toLowerCase()
         let start = m.text.replace(isPrefix, '')
         let clean = start.trim().split` `.slice(1)
         let text = clean.join` `
         for (let name in global.client.commands) {
            let cmd = global.client.commands[name].run
            let turn = cmd.usage instanceof Array ? cmd.usage.includes(command) : cmd.usage instanceof String ? cmd.usage == command : false
            //// cmd.usage.constuctor.name == 'Array' ? cmd.usage.includes(command) : cmd.usage.constructor.name == 'String' ? cmd.usage == command : false
            if (!m.text.startsWith('>') && !m.text.startsWith('=>') && !m.text.startsWith('?>') && !m.text.startsWith('$')) {
               if (!m.text.startsWith(myPrefix)) return
            }
            if (!turn) continue
            let group = global.groups[m.chat]
            let user = global.users[m.sender]
            if (!['activation', 'oactivation', 'ogcmanage', 'groups', 'info'].includes(name) && group && (group.banned || group.mute)) return
            if (!['me', 'owner'].includes(name) && user && user.banned) return
            if (typeof cmd.cache != 'undefined' && cmd.cache && typeof cmd.location != 'undefined') {
               let file = require.resolve(cmd.location)
               Func.reload(file)
            }
            if (typeof cmd.error != 'undefined' && cmd.error) {
               client.reply(m.chat, global.status.errorF, m)
               continue
            }
            if (typeof cmd.owner != 'undefined' && cmd.owner && !isOwner) {
               client.reply(m.chat, global.status.owner, m)
               continue
            }
            if (typeof cmd.premium != 'undefined' && cmd.premium && !isPrem) {
               client.reply(m.chat, global.status.premium, m)
               continue
            }
            if (typeof cmd.limit != 'undefined' && cmd.limit && !isPrem && !isOwner && global.users[m.sender].limit > 0) {
               global.users[m.sender].limit -= cmd.limit || 1
            }
            if (typeof cmd.limit != 'undefined' && cmd.limit && !isPrem && global.users[m.sender].limit < 1) {
               client.reply(m.chat, Func.texted('bold', `Sorry @${m.sender.split`@`[0]}, you don't have a limit, please exchange / buy limit with your points first. Send ${global.setting.multiprefix ? global.setting.prefix[0] : global.setting.onlyprefix}buy 1`), m)
               continue
            }
            if (typeof cmd.group != 'undefined' && cmd.group && !m.isGroup) {
               client.reply(m.chat, global.status.group, m)
               continue
            } else if (typeof cmd.botAdmin != 'undefined' && cmd.botAdmin && !isBotAdmin) {
               client.reply(m.chat, global.status.botAdmin, m)
               continue
            } else if (typeof cmd.admin != 'undefined' && cmd.admin && !isAdmin) {
               client.reply(m.chat, global.status.admin, m)
               continue
            }
            if (typeof cmd.private != 'undefined' && cmd.private && m.isGroup) {
               client.reply(m.chat, global.status.private, m)
               continue
            }
            cmd.async(m, {
               client,
               args,
               text,
               isPrefix,
               command,
               participants,
               isOwner,
               isAdmin,
               isBotAdmin,
               isPrem
            })
            break
         }
      }
   } catch (e) {
      console.log(e)
      client.reply(m.chat, Func.jsonFormat(e), m)
   }
}

Func.reload(require.resolve(__filename))