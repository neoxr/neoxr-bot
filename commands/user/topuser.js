let moment = require('moment-timezone')
moment.tz.setDefault('Asia/Jakarta').locale('id')
exports.run = {
   usage: ['topuserlocal', 'topuser'],
   async: async (m, {
      client,
      command,
      participants
   }) => {
      if (command == 'topuserlocal') {
         if (!m.isGroup) return client.reply(m.chat, global.status.group, m)
         let member = participants.map(u => u.id)
         let kontol = {}
         for (i = 0; i < member.length; i++) {
            if (typeof global.users[member[i]] != "undefined") {
               kontol[member[i]] = {
                  hit: global.users[member[i]].hit,
                  lastseen: global.users[member[i]].lastseen
               }
            }
         }
         let hit = Object.entries(kontol).sort((a, b) => b[1].hit - a[1].hit)
         let getUser = hit.map(v => v[0])
         let show = Math.min(10, hit.length)
         let teks = `❏  *T O P - U S E R S*\n\n`
         teks += hit.slice(0, show).map(([user, data], i) => (i + 1) + '. @' + user.split`@` [0] + '\n	›  *Hits* :  ' + Func.formatNumber(data.hit) + '\n	›  *Last Seen* : ' + moment(data.lastseen).format('DD/MM/YY HH:mm:ss')).join`\n`
         teks += `\n\n${global.setting.footer}`
         client.fakeStory(m.chat, teks, global.setting.header)
      } else if (command == 'topuser') {
         let hit = Object.entries(global.users).sort((a, b) => b[1].hit - a[1].hit)
         let getUser = hit.map(v => v[0])
         let show = Math.min(10, hit.length)
         let teks = `❏  *T O P - U S E R S*\n\n`
         teks += hit.slice(0, show).map(([user, data], i) => (i + 1) + '. @' + user.split`@` [0] + '\n	›  *Hits* :  ' + Func.formatNumber(data.hit) + '\n	›  *Last Seen* : ' + moment(data.lastseen).format('DD/MM/YY HH:mm:ss')).join`\n`
         teks += `\n\n${global.setting.footer}`
         client.fakeStory(m.chat, teks, global.setting.header)
      }
   },
   error: false
}