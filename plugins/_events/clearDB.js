export const run = {
   async: async (m, {
      client,
      Utils
   }) => {
      try {
         setInterval(async () => {
            let day = 86400000 * 3,
               now = new Date() * 1
            global.db.users.filter(v => now - v.lastseen > day && !v.premium && !v.banned && v.point < 1000000).map(v => {
               let user = global.db.users.find(x => x.jid == v.jid)
               if (user) Utils.removeItem(global.db.users, user)
            })
            global.db.chats.filter(v => now - v.lastseen > day).map(v => {
               let chat = global.db.chats.find(x => x.jid == v.jid)
               if (chat) Utils.removeItem(global.db.chats, chat)
            })
            global.db.groups.filter(v => now - v.activity > day).map(v => {
               let group = global.db.groups.find(x => x.jid == v.jid)
               if (group) Utils.removeItem(global.db.groups, group)
            })
         }, 60_000)
      } catch (e) {
         return client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false
}