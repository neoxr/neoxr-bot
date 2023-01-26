neoxr.create(async (m, {
   client,
   body,
   users,
   setting,
   isOwner,
   Func,
   Scraper
}) => {
   try {
      if (!m.fromMe && !isOwner && body && setting.chatbot && !global.evaluate_chars.some(v => body.startsWith(v)) && !setting.whitelist.includes(m.sender.replace(/@.+/,''))) {
         let json = await Scraper.simsimiV2(body, 'id')
         if (json.status) return client.reply(m.chat, json.msg, m)
      }
   } catch (e) {
      console.log(e)
      return client.reply(m.chat, Func.jsonFormat(e), m)
   }
}, {
   error: false,
   private: true
}, __filename)