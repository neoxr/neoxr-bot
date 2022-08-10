exports.run = {
   async: async (m, {
      client,
      body,
      chats,
      setting
   }) => {
      try { 
         if (body && !global.evaluate_chars.some(v => body.startsWith(v))) {
            let json = await scrap.chatAI(global.chatai_bid, global.chatai_key, body)
            if (!m.fromMe && setting.chatbot && json.status) return client.reply(m.chat, json.msg, null)
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