const { readFileSync: read } = require('fs')
neoxr.create(async (m, {
   client,
   body,
   isOwner,
   Func
}) => {
   try {
      // Clear DB
      setInterval(async () => {
         let day = 86400000 * 3,
            now = new Date() * 1
         global.db.users.filter(v => now - v.lastseen > day && !v.premium && !v.banned && v.point < 1000000).map(v => {
            let user = global.db.users.find(x => x.jid == v.jid)
            if (user) Func.removeItem(global.db.users, user)
         })
         global.db.chats.filter(v => now - v.lastchat > day).map(v => {
            let chat = global.db.chats.find(x => x.jid == v.jid)
            if (chat) Func.removeItem(global.db.chats, chat)
         })
         global.db.groups.filter(v => now - v.activity > day).map(v => {
            let group = global.db.groups.find(x => x.jid == v.jid)
            if (group) Func.removeItem(global.db.groups, group)
         })
      }, 60_000)

      // Anti Delete Personal Chat
      if (!m.isGroup && m.msg && m.msg.type == 0 && !isOwner) {
         const copy = await client.deleteObj(m, client)
         if (copy) {
            client.reply(m.chat, `📡 *System detects you deleted the message.*`, m).then(async () => {
               await client.copyNForward(m.chat, copy)
            })
         }
      }

      // Show View Once
      if (m.msg && m.msg.viewOnce && !isOwner) {
         let media = await client.downloadMediaMessage(m.msg)
         if (/image/.test(m.mtype)) {
            client.sendFile(m.chat, media, Func.filename('jpg'), body ? body : '', m)
         } else if (/video/.test(m.mtype)) {
            client.sendFile(m.chat, media, Func.filename('mp4'), body ? body : '', m)
         }
      }
   } catch (e) {
      console.log(e)
      return client.reply(m.chat, Func.jsonFormat(e), m)
   }
}, {
   error: false
}, __filename)