const cp = require('child_process')
const promisify = require('util').promisify
const exec = promisify(cp.exec).bind(cp)
const moment = require('moment-timezone')
moment.tz.setDefault('Asia/Jakarta').locale('id')
neoxr.create(async (m, {
   client,
   args,
   text,
   blockList,
   Func,
   prefix,
   command,
   isOwner
}) => {
   try {
      if (command == 'runtime' || command == 'run') return m.reply(`*Running for : [ ${Func.toTime(process.uptime() * 1000)} ]*`)
      if (command == 'server') {
         const json = await Func.fetchJson('http://ip-api.com/json')
         client.reply(m.chat, Func.jsonFormat(json), m)
      }
      if (command == 'q') {
         try {
            if (!m.quoted) return client.reply(m.chat, Func.texted('bold', `🚩 Reply to message that contain quoted.`), m)
            const msg = await store.loadMessage(m.chat, m.quoted.id)
            if (msg.quoted === null) return client.reply(m.chat, Func.texted('bold', `🚩 Message does not contain quoted.`), m)
            return client.copyNForward(m.chat, msg.quoted.fakeObj)
         } catch (e) {
            client.reply(m.chat, `🚩 Can't load message.`, m)
         }
      }
      if (command == 'ava') {
         let number = isNaN(text) ? (text.startsWith('+') ? text.replace(/[()+\s-]/g, '') : (text).split`@` [1]) : text
         if (!text && !m.quoted) return client.reply(m.chat, Func.texted('bold', `🚩 Mention or reply chat target.`), m)
         if (isNaN(number)) return client.reply(m.chat, Func.texted('bold', `🚩 Invalid number.`), m)
         if (number.length > 15) return client.reply(m.chat, Func.texted('bold', `🚩 Invalid format.`), m)
         try {
            if (text) {
               var user = number + '@s.whatsapp.net'
            } else if (m.quoted.sender) {
               var user = m.quoted.sender
            } else if (m.mentionedJid) {
               var user = number + '@s.whatsapp.net'
            }
         } catch (e) {} finally {
            let pic = false
            try {
               pic = await client.profilePictureUrl(user, 'image')
            } catch {} finally {
               if (!pic) return client.reply(m.chat, Func.texted('bold', `🚩 He/She didn't put a profile picture.`), m)
               client.sendFile(m.chat, pic, '', '', m)
            }
         }
      }
      if (command == 'ping') {
         client.sendReact(m.chat, '🕒', m.key)
         let o
         try {
            o = await exec('python speed.py')
         } catch (e) {
            o = e
         } finally {
            let {
               stdout,
               stderr
            } = o
            if (stdout.trim()) m.reply(stdout.trim())
            if (stderr.trim()) m.reply(stderr.trim())
         }
      }
      if (/\b(stat|botstat)\b/.test(command)) {
         let users = global.db.users.length
         let chats = global.db.chats.filter(v => v.jid.endsWith('.net')).length
         let groupList = async () => Object.entries(await client.groupFetchAllParticipating()).slice(0).map(entry => entry[1])
         let groups = await (await groupList()).map(v => v.id).length
         const stats = {
            users,
            chats,
            groups,
            blocked: blockList.length,
            receiver: global.db.setting.receiver.length,
            marked: global.db.setting.whitelist.length,
            uptime: Func.toTime(process.uptime() * 1000)
         }
         const system = global.db.setting
         client.sendMessageModify(m.chat, statistic(stats, system, Func), m, {
            largeThumb: true
         })
      }
   } catch (e) {
      client.reply(m.chat, Func.jsonFormat(e), m)
   }
}, {
   usage: ['ava', 'q', 'botstat', 'runtime', 'server', 'ping'],
   hidden: ['stat', 'run']
}, __filename)

const statistic = (stats, system, Func) => {
   return ` –  *B O T S T A T*

┌  ◦  ${Func.texted('bold', Func.formatter(stats.groups))} Groups Joined
│  ◦  ${Func.texted('bold', Func.formatter(stats.chats))} Personal Chats
│  ◦  ${Func.texted('bold', Func.formatter(stats.users))} Users In Database
│  ◦  ${Func.texted('bold', Func.formatter(stats.blocked))} Users Blocked
│  ◦  ${Func.texted('bold', Func.formatter(stats.marked))} Users Marked
│  ◦  ${Func.texted('bold', Func.formatter(stats.receiver))} Users Receiver
└  ◦  Runtime : ${Func.texted('bold', stats.uptime)}

 –  *S Y S T E M*

┌  ◦  ${Func.texted('bold', system.online ? '[ √ ]' : '[ × ]')}  Always Online
│  ◦  ${Func.texted('bold', system.chatbot ? '[ √ ]' : '[ × ]')}  Chatbot
│  ◦  ${Func.texted('bold', system.debug ? '[ √ ]' : '[ × ]')}  Debug Mode
│  ◦  ${Func.texted('bold', system.noprefix ? '[ √ ]' : '[ × ]')}  No Prefix
│  ◦  ${Func.texted('bold', system.self ? '[ √ ]' : '[ × ]')}  Self Mode
│  ◦  ${Func.texted('bold', system.viewstory ? '[ √ ]' : '[ × ]')}  Story Viewer
└  ◦  Prefix : ${Func.texted('bold', system.multiprefix ? '( ' + system.prefix.map(v => v).join(' ') + ' )' : '( ' + system.onlyprefix + ' )')}

${global.footer}`
}