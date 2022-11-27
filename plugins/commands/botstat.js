exports.run = {
   usage: ['stat'],
   async: async (m, {
      client
   }) => {
      try {
         const users = global.db.users.length
         const chats = global.db.chats.filter(v => v.jid.endsWith('.net')).length
         let groupList = async () => Object.entries(await client.groupFetchAllParticipating()).slice(0).map(entry => entry[1])
         const groups = await (await groupList()).map(v => v.id).length
         const stats = {
            users,
            chats,
            groups,
            uptime: Func.toTime(process.uptime() * 1000)
         }
         const system = global.db.setting
         client.sendMessageModify(m.chat, statistic(stats, system), m, {
            largeThumb: true,
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
   return `◦  ${Func.texted('bold', stats.groups)} Groups Joined
◦  ${Func.texted('bold', stats.chats)} Personal Chats
◦  ${Func.texted('bold', stats.users)} Users In Database
◦  ${Func.switcher(system.chatbot, '[ √ ]', '[ × ]')}  Chat AI
◦  ${Func.switcher(system.debug, '[ √ ]', '[ × ]')}  Debug Mode
◦  ${Func.switcher(system.online, '[ √ ]', '[ × ]')}  Always Online
◦  ${Func.switcher(system.self, '[ √ ]', '[ × ]')}  Self Mode
◦  ${Func.switcher(system.viewstory, '[ √ ]', '[ × ]')}  Story Viewer
◦  Prefix : ${Func.texted('bold', system.multiprefix ? '( ' + system.prefix.map(v => v).join(' ') + ' )' : '( ' + system.onlyprefix + ' )')}
◦  Runtime : ${Func.texted('bold', stats.uptime)}`
}