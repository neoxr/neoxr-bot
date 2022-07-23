exports.run = {
   usage: ['botstat', 'stat'],
   async: async (m, {
      client
   }) => {
      try {
         let users = Object.entries(global.db.users).length
         let chats = Object.keys(global.db.chats).filter(v => v.endsWith('.net')).length
         let groups = Object.entries(global.db.groups).length
         let banned = Object.entries(global.db.users).filter(([jid, data]) => data.banned).length
         let premium = Object.entries(global.db.users).filter(([jid, data]) => data.premium).length
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
            premium,
            hitstat,
            uptime: Func.toTime(process.uptime() * 1000)
         }
         const system = global.db.setting
         client.sendMessageModify(m.chat, statistic(stats, system), m, {
            title: '© neoxr-bot v2.2.0 (Public Bot)',
            ads: false,
            largeThumb: true,
            thumbnail: await Func.fetchBuffer('https://telegra.ph/file/d826ed4128ba873017479.jpg')
         })
      } catch (e) {
         client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   owner: true,
   cache: true,
   location: __filename
}

const statistic = (stats, system) => {
   return `乂  *B O T S T A T*

	◦  ${Func.texted('bold', stats.groups)} Groups Joined
	◦  ${Func.texted('bold', stats.chats)} Personal Chats
	◦  ${Func.texted('bold', stats.users)} Users In Database
	◦  ${Func.texted('bold', stats.banned)} Users Banned
	◦  ${Func.texted('bold', stats.mimic)} Mimics Target
	◦  ${Func.texted('bold', stats.premium)} Premium Users
	◦  ${Func.texted('bold', stats.hitstat)} Commands Hit
	◦  Runtime : ${Func.texted('bold', stats.uptime)}

乂  *S Y S T E M*

	◦  ${Func.texted('bold', system.autodownload ? '[ √ ]' : '[ × ]')}  Auto Download
	◦  ${Func.texted('bold', system.chatbot ? '[ √ ]' : '[ × ]')}  Chat AI
	◦  ${Func.texted('bold', system.debug ? '[ √ ]' : '[ × ]')}  Debug Mode
	◦  ${Func.texted('bold', system.online ? '[ √ ]' : '[ × ]')}  Always Online
	◦  ${Func.texted('bold', system.self ? '[ √ ]' : '[ × ]')}  Self Mode
	◦  Prefix : ${Func.texted('bold', system.multiprefix ? '( ' + system.prefix.map(v => v).join(' ') + ' )' : '( ' + system.onlyprefix + ' )')}

${global.footer}`
}