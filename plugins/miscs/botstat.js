import { format } from 'date-fns'

export const run = {
   usage: ['botstat'],
   hidden: ['stat'],
   category: 'miscs',
   async: async (m, {
      client,
      blockList,
      setting,
      Utils
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
            banned,
            blocked: blockList.length,
            premium,
            hitstat,
            uptime: Utils.toTime(process.uptime() * 1000)
         }
         const system = global.db.setting
         client.sendMessageModify(m.chat, statistic(Utils, stats, system), m, {
            largeThumb: true,
            thumbnail: Utils.isUrl(setting.cover) ? setting.cover : Buffer.from(setting.cover, 'base64')
         })
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,

}

const statistic = (Utils, stats, system) => {
   if (global.db.setting.style == 2) {
      return ` –  *B O T S T A T*

┌  ◦  ${Utils.texted('bold', Utils.formatNumber(stats.groups))} Groups Joined
│  ◦  ${Utils.texted('bold', Utils.formatNumber(stats.chats))} Personal Chats
│  ◦  ${Utils.texted('bold', Utils.formatNumber(stats.users))} Users In Database
│  ◦  ${Utils.texted('bold', Utils.formatNumber(stats.banned))} Users Banned
│  ◦  ${Utils.texted('bold', Utils.formatNumber(stats.blocked))} Users Blocked
│  ◦  ${Utils.texted('bold', Utils.formatNumber(stats.premium))} Premium Users
│  ◦  ${Utils.texted('bold', Utils.formatNumber(stats.hitstat))} Commands Hit
└  ◦  Runtime : ${Utils.texted('bold', stats.uptime)}

 –  *S Y S T E M*

┌  ◦  ${Utils.texted('bold', system.autobackup ? '[ √ ]' : '[ × ]')}  Auto Backup
│  ◦  ${Utils.texted('bold', system.autodownload ? '[ √ ]' : '[ × ]')}  Auto Download
│  ◦  ${Utils.texted('bold', system.antispam ? '[ √ ]' : '[ × ]')}  Anti Spam
│  ◦  ${Utils.texted('bold', system.debug ? '[ √ ]' : '[ × ]')}  Debug Mode
│  ◦  ${Utils.texted('bold', system.groupmode ? '[ √ ]' : '[ × ]')}  Group Mode
│  ◦  ${Utils.texted('bold', system.online ? '[ √ ]' : '[ × ]')}  Always Online
│  ◦  ${Utils.texted('bold', system.notifier ? '[ √ ]' : '[ × ]')}  Expiry Notification
│  ◦  ${Utils.texted('bold', system.self ? '[ √ ]' : '[ × ]')}  Self Mode
│  ◦  ${Utils.texted('bold', system.noprefix ? '[ √ ]' : '[ × ]')}  No Prefix
│  ◦  Prefix : ${Utils.texted('bold', system.multiprefix ? '( ' + system.prefix.map(v => v).join(' ') + ' )' : '( ' + system.onlyprefix + ' )')}
└  ◦  Reset At : ${format(Date.now(), 'dd/MM/yy HH:mm')}

${global.footer}`
   } else {
      return `乂  *B O T S T A T*

	◦  ${Utils.texted('bold', Utils.formatNumber(stats.groups))} Groups Joined
	◦  ${Utils.texted('bold', Utils.formatNumber(stats.chats))} Personal Chats
	◦  ${Utils.texted('bold', Utils.formatNumber(stats.users))} Users In Database
	◦  ${Utils.texted('bold', Utils.formatNumber(stats.banned))} Users Banned
	◦  ${Utils.texted('bold', Utils.formatNumber(stats.blocked))} Users Blocked
	◦  ${Utils.texted('bold', Utils.formatNumber(stats.premium))} Premium Users
	◦  ${Utils.texted('bold', Utils.formatNumber(stats.hitstat))} Commands Hit
	◦  Runtime : ${Utils.texted('bold', stats.uptime)}

乂  *S Y S T E M*

	◦  ${Utils.texted('bold', system.autobackup ? '[ √ ]' : '[ × ]')}  Auto Backup
	◦  ${Utils.texted('bold', system.autodownload ? '[ √ ]' : '[ × ]')}  Auto Download
	◦  ${Utils.texted('bold', system.antispam ? '[ √ ]' : '[ × ]')}  Anti Spam
	◦  ${Utils.texted('bold', system.debug ? '[ √ ]' : '[ × ]')}  Debug Mode
	◦  ${Utils.texted('bold', system.groupmode ? '[ √ ]' : '[ × ]')}  Group Mode
	◦  ${Utils.texted('bold', system.online ? '[ √ ]' : '[ × ]')}  Always Online
   ◦  ${Utils.texted('bold', system.notifier ? '[ √ ]' : '[ × ]')}  Expiry Notification
	◦  ${Utils.texted('bold', system.self ? '[ √ ]' : '[ × ]')}  Self Mode
	◦  ${Utils.texted('bold', system.noprefix ? '[ √ ]' : '[ × ]')}  No Prefix
	◦  Prefix : ${Utils.texted('bold', system.multiprefix ? '( ' + system.prefix.map(v => v).join(' ') + ' )' : '( ' + system.onlyprefix + ' )')}
	◦  Reset At : ${format(Date.now(), 'dd/MM/yy HH:mm')}

${global.footer}`
   }
}