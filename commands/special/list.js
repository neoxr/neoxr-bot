let moment = require('moment-timezone')
moment.tz.setDefault('Asia/Jakarta').locale('id')
exports.run = {
   usage: ['list'],
   async: async (m, {
      client,
      args,
      isPrefix
   }) => {
      let opt = ['asupan', 'ban', 'error', 'chat']
      if (!args || !args[0]) return client.reply(m.chat, Func.texted('bold', `Give a option ban, block, or prem.`), m)
      if (!opt.includes(args[0])) return client.reply(m.chat, Func.texted('bold', `Option is invalid.`), m)
      let users = global.users
      if (args[0] == 'ban') {
         userBan = []
         for (let jid in users) {
            if (users[jid].banned) userBan.push(jid)
         }
         if (userBan.length == 0) return client.reply(m.chat, Func.texted('bold', `No users are banned.`), m)
         return client.fakeStory(m.chat, `❏  *L I S T B A N*\n\n*“There are ${userBan.length} users who have been banned in the database.”*\n\n${userBan.map(v => '	◦  @' + v.replace(/@.+/, '')).join('\n') + '\n\n' + global.setting.footer}`, global.setting.header)
      } else if (args[0] == 'asupan') {
         let asupan = global.db.setting.asupan
         if (asupan.length == 0) return client.reply(m.chat, Func.texted('bold', `Null Data.`), m)
         return client.fakeStory(m.chat, `❏  *L I S T - A S U P A N*\n\n*“There are ${asupan.length} data sources in the database.”*\n\n${asupan.map(v => '	◦  ' + v).join('\n') + '\n\n' + global.setting.footer}`, global.setting.header)
      } else if (args[0] == 'error') {
         let error = global.setting.errorCmd
         if (error.length == 0) return client.reply(m.chat, Func.texted('bold', `Null Data.`), m)
         return client.fakeStory(m.chat, `❏  *L I S T - E R R O R*\n\n*“There are ${error.length} error commands in the database.”*\n\n${error.map(v => '	◦  ' + isPrefix + v).join('\n') + '\n\n' + global.setting.footer}`, global.setting.header)
      } else if (args[0] == 'chat') {
         let chats = Object.entries(global.chats).sort((a, b) => b[1].lastseen - a[1].lastseen).filter(([v, x]) => v.endsWith('.net'))
         if (chats.length == 0) return client.reply(m.chat, Func.texted('bold', `Null Data.`), m)
         return client.fakeStory(m.chat, `❏  *L I S T - C H A T*\n\n*“There are ${chats.length} users using bot in personal chat.”*\n\n${chats.map(([v, x]) => '	◦  @' + v.replace(/@.+/, '') + '\n	     *Chat* : ' + Func.formatNumber(x.chat) + '\n	     *Lastchat* : ' + moment(x.lastseen).format('DD/MM/YY HH:mm:ss')).join('\n') + '\n\n' + global.setting.footer}`, global.setting.header)
      }
   },
   error: false
}