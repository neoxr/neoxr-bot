exports.run = {
   async: async (m, {
      client,
   }) => {
      try {
         setInterval(async () => {
            let day = 86400000 * 7,
               now = new Date() * 1
            for (let jid in global.db.users) {
               if (now - global.db.users[jid].lastseen > day && !global.db.users[jid].premium && !global.db.users[jid].banned && global.db.users[jid].point < 5000000) delete global.db.users[jid]
            }
            for (let jid in global.db.chats) {
               if (now - global.db.chats[jid].lastseen > day) delete global.db.chats[jid]
            }
            for (let jid in global.db.groups) {
               if (now - global.db.groups[jid].activity > day && !global.db.groups[jid].stay && global.db.groups[jid].expired == 0) {
                  delete global.db.groups[jid]
               }
            }
         }, 60_000)
      } catch (e) {
         return client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   cache: true,
   location: __filename
}