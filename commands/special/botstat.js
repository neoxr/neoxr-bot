let moment = require('moment-timezone')
moment.tz.setDefault('Asia/Jakarta').locale('id')
exports.run = {
   usage: ['stat', 'botstat'],
   async: async (m, {
      client
   }) => {
      let groups = await (await client.groupList()).length
      let chats = Object.keys(global.chats).filter(v => v.endsWith('.net')).length
      let users = Object.keys(global.users).length
      let stat = Object.keys(global.statistic)
      class Hit extends Array {
         total(key) {
            return this.reduce((a, b) => a + (b[key] || 0), 0)
         }
      }
      let sum = new Hit(...Object.values(global.statistic))
      let hitstat = sum.total('hitstat') != 0 ? sum.total('hitstat') : 0
      let system = global.setting
      let procUp = process.uptime() * 1000
      let uptime = Func.toTime(procUp)
      let banned = 0
      for (let jid in global.users) global.users[jid].banned ? banned++ : ''
      let whitelist = 0
      for (let jid in global.users) global.users[jid].whitelist ? whitelist++ : ''
      let point = [...new Set(Object.entries(global.users).filter(([v, x]) => v.point != 0).map(([v, x]) => x.point))]
      let limit = [...new Set(Object.entries(global.users).filter(([v, x]) => v.limit != 0).map(([v, x]) => x.limit))]
      let hit = [...new Set(Object.entries(global.users).filter(([v, x]) => v.hit != 0).map(([v, x]) => x.hit))]
      let online = [...new Set(Object.entries(global.users).filter(([v, x]) => v.lastseen != 0).map(([v, x]) => x.lastseen))]
      let avg = {
         point: Func.formatNumber((point.reduce((a, b) => a + b) / point.length).toFixed(0)),
         limit: Func.formatNumber((limit.reduce((a, b) => a + b) / limit.length).toFixed(0)),
         hit: Func.formatNumber((hit.reduce((a, b) => a + b) / hit.length).toFixed(0)),
         online: (online.reduce((a, b) => a + b) / online.length).toFixed(0),
      }
      await client.fakeStory(m.chat, await botstat(groups, chats, users, system, banned, whitelist, hitstat, uptime, avg), global.setting.header, [m.sender])
   },
   error: false,
   cache: true,
   location: __filename
}

let botstat = async (groups, chats, users, system, banned, whitelist, hitstat, uptime, avg) => {
   return `❏  *S T A T I S T I C*

	◦  ${Func.texted('bold', groups)} Groups Joined
	◦  ${Func.texted('bold', chats)} Personal Chats
	◦  ${Func.texted('bold', users)} Users In Database
	◦  ${Func.texted('bold', banned)} Users Banned
	◦  ${Func.texted('bold', whitelist)} Users Whitelist
	◦  ${Func.texted('bold', setting.errorCmd.length)} Command Errors
	◦  ${Func.texted('bold', Func.simpFormat(Func.formatNumber(hitstat)))} Command Hits
	◦  ${Func.texted('bold', await Func.getSize(setting.uploadSize))} Total Media Sent
	◦  ${Func.texted('bold', await Func.getSize(setting.receiveSize))} Total Media Received
	◦  ${Func.texted('bold', `Uptime ~> ${uptime}`)}

❏  *A V E R A G E*

	◦  Point : ${Func.texted('bold', avg.point)}
	◦  Limit : ${Func.texted('bold', avg.limit)}
	◦  Command Hit : ${Func.texted('bold', avg.hit)}
	◦  Online : ${Func.texted('bold', moment(parseInt(avg.online)).format('HH:mm'))} WIB
	
❏  *S Y S T E M*

	◦  ${Func.switcher(system.autodownload, '[ √ ]', '[ × ]')}  Auto Download
	◦  ${Func.switcher(system.games, '[ √ ]', '[ × ]')}  Game Features
	◦  ${Func.switcher(system.self, '[ √ ]', '[ × ]')}  Self Mode
	◦  ${Func.switcher(system.groupmode, '[ √ ]', '[ × ]')}  Group Mode
	◦  Prefix : ${system.multiprefix ? ' ( ' + system.prefix.map(v => v).join(' ') + ' )' : ' ( ' + system.onlyprefix + ' )'}

${global.setting.footer}`
}