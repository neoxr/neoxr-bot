exports.run = {
   async: async (m, {
      client,
      body,
      chats,
      setting,
      prefixes
   }) => {
      try { 
         if (body && !global.evaluate_chars.some(v => body.startsWith(v))) {
            let json = await scrap.chatAI(global.chatai_bid, global.chatai_key, body)
            if (!m.fromMe && setting.chatbot && json.status) return client.reply(m.chat, json.msg, null)
            if (!m.fromMe) return client.reply(m.chat, setting.msg, null).then(() => {
               try {
                  chats.chat += 1
                  chats.lastchat = new Date() * 1
               } catch {
                  global.db.chats[m.chat] = {}
                  global.db.chats[m.chat].command = new Date() * 1
                  global.db.chats[m.chat].chat = 1
                  global.db.chats[m.chat].lastseen = new Date() * 1
               }
            })
         }
      } catch (e) {
         console.log(e)
      }
   },
   error: false,
   private: true,
   cache: true,
   location: __filename
}