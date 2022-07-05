exports.run = {
   async: async (m, {
      client,
   }) => {
      try {
         setInterval(async () => {
            let day = 86400000 * 1,
               now = new Date() * 1
            for (let jid in global.db.chats) {
               if (now - global.db.chats[jid].lastseen > day) delete global.db.chats[jid]
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