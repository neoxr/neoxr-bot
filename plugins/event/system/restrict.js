exports.run = {
   async: async (m, {
      client,
      body,
      chats,
      setting,
      isOwner
   }) => {
      try {
         if (!m.fromMe && isOwner) return
    	 // if (/(save|sv)/.test(body)) return client.reply(m.chat, `Males, gak penting!`, m).then(async () => await client.updateBlockStatus(m.sender, 'block'))
         // if (body.toUpperCase() == 'P') return client.reply(m.chat, `PaPePaPe kalo chat orang itu yang bener Tolol!`, m).then(async () => await client.updateBlockStatus(m.sender, 'block'))
      } catch (e) {
         console.log(e)
      }
   },
   error: false,
   private: true,
   cache: true,
   location: __filename
}