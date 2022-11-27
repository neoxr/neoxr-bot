exports.run = {
   async: async (m, {
      client,
      isOwner
   }) => {
      try {
         if (!m.isGroup && m.msg && m.msg.type == 0 && !isOwner) {
            const copy = await client.deleteObj(m, client)
            if (copy) {
               client.reply(m.chat, Func.texted('bold', `💀 Deleted message . . .`), m).then(async () => {
                  await client.copyNForward(m.chat, copy)
               })
            }
         }
      } catch (e) {
         return client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   cache: true,
   location: __filename
}