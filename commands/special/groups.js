const moment = require('moment-timezone')
moment.tz.setDefault('Asia/Jakarta').locale('id')
exports.run = {
   usage: ['groups'],
   async: async (m, {
      client
   }) => {
      let groups = await client.groupList()
      let teks = '❏  *G R O U P - L I S T*\n\n'
      for (let i = 0; i < groups.length; i++) {
         if (groups[i].id in global.groups) {
            let v = global.groups[groups[i].id]
            teks += ' ›  *' + (i + 1) + '.* ' + groups[i].subject + '\n'
            teks += '    *💳* : ' + (groups[i].id).split('@')[0] + '\n'
            teks += v.stay ? '    FOREVER' : (v.expired == 0 ? '    NOT SET' : '    ' + Func.timeReverse(v.expired - new Date() * 1))
            teks += ' [ ' + groups[i].participants.length + ' ]\n'
            teks += '    *🎟️* : ' + moment(v.activity).format('DD/MM/YY HH:mm:ss') + '\n\n'
         } else global.groups[groups[i].id] = {
            activity: new Date * 1,
            banned: false,
            mute: false,
            game: false,
            welcome: true,
            textwel: '',
            left: false,
            textleft: '',
            notify: false,
            spamProtect: false,
            localonly: false,
            nodelete: true,
            nobadword: false,
            nolink: false,
            novirtex: false,
            expired: 0,
            stay: false
         }
      }
      client.fakeStory(m.chat, teks + global.setting.footer, global.setting.header)
   },
   owner: true,
   cache: true,
   location: __filename
}