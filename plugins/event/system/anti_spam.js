exports.run = {
   async: async (m, {
      client,
      users,
      chats,
      isAdmin,
      isBotAdmin,
      isOwner,
      groupSet
   }) => {
      try {
         let unban = new Date(users.banTemp + global.timer)
         if (new Date - users.banTemp > global.timer) {
            if (!users.banned && !m.fromMe) {
               users.spam += 1
               let spam = users.spam
               if (spam >= 2) setTimeout(() => {
                  users.spam = 0
               }, global.cooldown * 1000)
               if (users.banTimes >= 3) return client.reply(m.chat, `🚩 You are permanently banned because you have been temporarily banned 3 times.`, m).then(() => {
                  users.banned = true
                  users.banTemp = 0
                  users.banTimes = 0
               })
               if (m.isGroup && spam == 4) return client.reply(m.chat, `🚩 System detects you are spamming, please cooldown for *${global.cooldown} seconds*.`, m)
               if (m.isGroup && spam >= 5) return client.reply(m.chat, `🚩 You were temporarily banned for ${((global.timer / 1000) / 60)} minutes cause you over spam.`, m).then(() => {
                  users.banTemp = new Date() * 1
                  users.banTimes += 1
                  if (!isOwner && chats) {
                     if (new Date() * 1 - chats.command > global.cooldown * 1000) {
                        chats.command = new Date() * 1
                     } else {
                        if (!m.fromMe) return
                     }
                  }
               })
               if (!m.isGroup && spam == 4) return client.reply(m.chat, `🚩 System detects you are spamming, please cooldown for *${global.cooldown} seconds*.`, m)
               if (!m.isGroup && spam >= 5) return client.reply(m.chat, `🚩 You were temporarily banned for ${((global.timer / 1000) / 60)} minutes cause you over spam.`, m).then(() => {
                  users.banTemp = new Date() * 1
                  users.banTimes += 1
               })
            }
         } else return
      } catch (e) {
         // return client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   cache: true,
   location: __filename
}