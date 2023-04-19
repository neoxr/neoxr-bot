const moment = require('moment-timezone')
exports.run = {
   usage: ['botstat'],
   hidden: ['stat'],
   category: 'special',
   async: async (m, {
      client,
      blockList
   }) => {
      try {
         let users = global.db.users.length
         let chats = global.db.chats.filter(v => v.jid && v.jid.endsWith('.net')).length
         let groupList = async () => Object.entries(await client.groupFetchAllParticipating()).slice(0).map(entry => entry[1])
         let groups = await (await groupList()).map(v => v.id).length
         let banned = global.db.users.filter(v => v.banned).length
         let premium = global.db.users.filter(v => v.premium).length
         class Hit extends Array {
            total(key) {
               return this.reduce((a, b) => a + (b[key] || 0), 0)
            }
         }
         let sum = new Hit(...Object.values(global.db.statistic))
         let hitstat = sum.total('hitstat') != 0 ? sum.total('hitstat') : 0
         const stats = {
            users,
            chats,
            groups,
            mimic: (global.db.setting.mimic).length,
            banned,
            blocked: blockList.length,
            premium,
            hitstat,
            uptime: Func.toTime(process.uptime() * 1000)
         }
         const system = global.db.setting
         client.sendMessageModify(m.chat, statistic(stats, system), m, {
            largeThumb: true
         })
      } catch (e) {
         client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   cache: true,
   location: __filename
}

const statistic = (stats, system) => {
   if (global.db.setting.menuStyle == 3 || global.db.setting.menuStyle == 4) {
      return ` –  *B O T S T A T*

┌  ◦  ${Func.texted('bold', Func.formatNumber(stats.groups))} Groups Joined
│  ◦  ${Func.texted('bold', Func.formatNumber(stats.chats))} Personal Chats
│  ◦  ${Func.texted('bold', Func.formatNumber(stats.users))} Users In Database
│  ◦  ${Func.texted('bold', Func.formatNumber(stats.banned))} Users Banned
│  ◦  ${Func.texted('bold', Func.formatNumber(stats.blocked))} Users Blocked
│  ◦  ${Func.texted('bold', Func.formatNumber(stats.mimic))} Mimics Target
│  ◦  ${Func.texted('bold', Func.formatNumber(stats.premium))} Premium Users
│  ◦  ${Func.texted('bold', Func.formatNumber(stats.hitstat))} Commands Hit
└  ◦  Runtime : ${Func.texted('bold', stats.uptime)}

 –  *S Y S T E M*

┌  ◦  ${Func.texted('bold', system.autodownload ? '[ √ ]' : '[ × ]')}  Auto Download
│  ◦  ${Func.texted('bold', system.chatbot ? '[ √ ]' : '[ × ]')}  Chat AI
│  ◦  ${Func.texted('bold', system.debug ? '[ √ ]' : '[ × ]')}  Debug Mode
│  ◦  ${Func.texted('bold', system.groupmode ? '[ √ ]' : '[ × ]')}  Group Mode
│  ◦  ${Func.texted('bold', system.online ? '[ √ ]' : '[ × ]')}  Always Online
│  ◦  ${Func.texted('bold', system.self ? '[ √ ]' : '[ × ]')}  Self Mode
│  ◦  ${Func.texted('bold', system.noprefix ? '[ √ ]' : '[ × ]')}  No Prefix
│  ◦  Prefix : ${Func.texted('bold', system.multiprefix ? '( ' + system.prefix.map(v => v).join(' ') + ' )' : '( ' + system.onlyprefix + ' )')}
└  ◦  Reset At : ${moment(system.lastReset).format('DD/MM/YYYY HH:mm')}

${global.footer}`
   } else {
      return `乂  *B O T S T A T*

	◦  ${Func.texted('bold', Func.formatNumber(stats.groups))} Groups Joined
	◦  ${Func.texted('bold', Func.formatNumber(stats.chats))} Personal Chats
	◦  ${Func.texted('bold', Func.formatNumber(stats.users))} Users In Database
	◦  ${Func.texted('bold', Func.formatNumber(stats.banned))} Users Banned
	◦  ${Func.texted('bold', Func.formatNumber(stats.blocked))} Users Blocked
	◦  ${Func.texted('bold', Func.formatNumber(stats.mimic))} Mimics Target
	◦  ${Func.texted('bold', Func.formatNumber(stats.premium))} Premium Users
	◦  ${Func.texted('bold', Func.formatNumber(stats.hitstat))} Commands Hit
	◦  Runtime : ${Func.texted('bold', stats.uptime)}

乂  *S Y S T E M*

	◦  ${Func.texted('bold', system.autodownload ? '[ √ ]' : '[ × ]')}  Auto Download
	◦  ${Func.texted('bold', system.chatbot ? '[ √ ]' : '[ × ]')}  Chat AI
	◦  ${Func.texted('bold', system.debug ? '[ √ ]' : '[ × ]')}  Debug Mode
	◦  ${Func.texted('bold', system.groupmode ? '[ √ ]' : '[ × ]')}  Group Mode
	◦  ${Func.texted('bold', system.online ? '[ √ ]' : '[ × ]')}  Always Online
	◦  ${Func.texted('bold', system.self ? '[ √ ]' : '[ × ]')}  Self Mode
	◦  ${Func.texted('bold', system.noprefix ? '[ √ ]' : '[ × ]')}  No Prefix
	◦  Prefix : ${Func.texted('bold', system.multiprefix ? '( ' + system.prefix.map(v => v).join(' ') + ' )' : '( ' + system.onlyprefix + ' )')}
	◦  Reset At : ${moment(system.lastReset).format('DD/MM/YYYY HH:mm')}

${global.footer}`
   }
}