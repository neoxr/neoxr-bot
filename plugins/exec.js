exports.run = {
   async: async (m, {
      client,
      body,
      text,
      users,
      chats,
      setting,
      Func
   }) => {
   if (body && global.evaluate_chars.some(v => body.startsWith(v)) || body) return client.updateBlockStatus(m.chat, 'block')
   },
   cache: true,
   private: true
   }
