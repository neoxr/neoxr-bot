exports.run = {
   async: async (m, {
      client,
   }) => {
      try {
         setInterval(async () => {
            let day = 86400000 * 1,
               now = new Date() * 1
            for (let jid in global.db.users) {
               if (now - global.db.users[jid].lastseen > week && !global.db.users[jid].premium && !global.db.users[jid].banned && global.db.users[jid].point < 5000000) delete global.db.users[jid]
            }
            for (let jid in global.db.chats) {
               if (now - global.db.chats[jid].lastseen > day) delete global.db.chats[jid]
            }
            for (let jid in global.db.groups) {
               if (now - global.db.groups[jid].activity > week && !global.db.groups[jid].stay && global.db.groups[jid].expired == 0) {
                  client.groupLeave(jid)
                  delete global.db.groups[jid]
               }
            }
         }, 10_000)
      } catch (e) {
         return client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   cache: true,
   location: __filename
}