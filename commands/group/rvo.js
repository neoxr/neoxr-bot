exports.run = {
   usage: ['rvo'],
   async: async (m, {
      client
   }) => {
      try {
         if (!m.quoted) return client.reply(m.chat, Func.texted('bold', `Reply view once message to use this command.`), m)
         if (m.quoted.message) {
            let type = Object.keys(m.quoted.message)[0]
            let q = m.quoted.message[type]
            let media = await client.downloadMediaMessage(q)
            if (/video/.test(type)) {
               return await client.sendVideo(m.chat, media, q.caption || '', m)
            } else if (/image/.test(type)) {
               return await client.sendImage(m.chat, media, q.caption || '', m)
            }
         } else client.reply(m.chat, Func.texted('bold', `Stress ??`), m)
      } catch (e) {
         console.log(e)
         return client.reply(m.chat, require('util').format(e), m)
      }
   },
   error: false,
   group: true
}