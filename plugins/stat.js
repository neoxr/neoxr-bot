exports.run = {
   usage: ['stat'],
   async: async (m, {
      client
   }) => {
      try {
         let users = Object.entries(global.db.users).length
         let chats = Object.keys(global.db.chats).filter(v => v.endsWith('.net')).length
         let groups = Object.entries(global.db.groups).length
         let premium = Object.entries(global.db.users).filter(([jid, data]) => data.premium).length
         const stats = {
            users,
            chats,
            groups,
            mimic: (global.db.setting.mimic).length,
            premium,
            uptime: Func.toTime(process.uptime() * 1000)
         }
         const system = global.db.setting
         client.sendMesssageModify(m.chat, statistic(stats, system), m, {
            title: '© neoxr-bot v2.2.0 (Public Bot)',
            ads: false,
            largeThumb: true,
            thumbnail: 'https://telegra.ph/file/d826ed4128ba873017479.jpg'
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
	◦  ${Func.texted('bold', stats.mimic)} Mimic Target
	◦  ${Func.texted('bold', stats.premium)} Premium Users

乂  *S Y S T E M*

	◦  ${Func.switcher(system.chatbot, '🟢', '🔴')}  Chat AI
	◦  ${Func.switcher(system.debug, '🟢', '🔴')}  Debug Mode
	◦  ${Func.switcher(system.online, '🟢', '🔴')}  Always Online
	◦  ${Func.switcher(system.self, '🟢', '🔴')}  Self Mode
	◦  Prefix : ${Func.texted('bold', system.multiprefix ? '( ' + system.prefix.map(v => v).join(' ') + ' )' : '( ' + system.onlyprefix + ' )')}
	◦  Uptime : ${Func.texted('bold', stats.uptime)}

${global.footer}`
}