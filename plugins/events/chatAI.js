exports.run = {
   async: async (m, {
      client,
      body,
      chats,
      setting,
      prefixes
   }) => {
      try {
         if (body && !global.evaluate_chars.some(v => body.startsWith(v)) && !global.db.setting.whitelist.includes(m.sender)) {
            var json = await scrap.simsimi(body)
            if (!json.status) {
               var json = await scrap.chatAI(global.chatai_bid, global.chatai_key, body)
            }
            if (!m.isGroup) {
               if (!m.fromMe && setting.chatbot && json.status) {
                  client.reply(m.chat, json.msg, null)
               }
            } else {
               let me = [...new Set([...(m.mentionedJid || []), ...(m.quoted ? [m.quoted.sender] : [])])]
               for (let jid of me) {
                  if (client.decodeJid(client.user.id) != me) continue
                  if (!m.fromMe && setting.chatbot && json.status) {
                     client.reply(m.chat, json.msg, m)
                  }
               }
            }
         }
      } catch (e) {
         console.log(e)
      }
   },
   error: false,
   cache: true,
   location: __filename
}