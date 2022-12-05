const moment = require('moment-timezone')
moment.tz.setDefault('Asia/Jakarta').locale('id')
exports.run = {
   usage: ['common'],
   use: 'mention or reply',
   category: 'group',
   async: async (m, {
      client,
      text,
      isPrefix
   }) => {
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
         let arr = [],
            rows = []
         let groups = Object.values(await client.groupFetchAllParticipating())
         for (let group of groups) {
            let participants = group.participants || []
            if (participants.some(u => u.id == user)) arr.push(group)
         }
         if (arr.length == 0) return client.reply(m.chat, Func.texted('bold', `🚩 No groups with bots.`), m)
         arr.map(x => {
            let v = global.db.groups.find(v => v.jid == x.id)
            if (v) {
               rows.push({
                  title: x.subject,
                  rowId: `${isPrefix}gc ${x.id}`,
                  description: `[ ${v.stay ? 'FOREVER' : (v.expired == 0 ? 'NOT SET' : Func.timeReverse(v.expired - new Date() * 1))}  | ${x.participants.length} | ${(v.mute ? 'OFF' : 'ON')} | ${moment(v.activity).format('DD/MM/YY HH:mm:ss')} ]`
               })
            } else {
               global.db.groups.push({
                  jid: x.id,
                  activity: new Date * 1,
                  autoread: true,
                  antidelete: true,
                  antilink: false,
                  antivirtex: false,
                  filter: false,
                  game: true,
                  left: false,
                  localonly: false,
                  mute: false,
                  member: {},
                  text_left: '',
                  text_welcome: '',
                  welcome: true,
                  expired: 0,
                  stay: false
               })
            }
         })
         client.sendList(m.chat, '', `Bot and @${user.replace(/@.+/,'')} are in same *${arr.length}* groups. 🍟`, '', 'Tap!', [{
            rows
         }], m)
      }
   },
   error: false,
   cache: true,
   location: __filename
}