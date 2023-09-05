exports.run = {
   async: async (m, {
      client,
      body,
      isOwner,
      groupSet,
      setting,
      Func
   }) => {
      try {
         if (groupSet.autosticker && /video|image/.test(m.mtype)) {
            let mime = m.msg.mimetype
            if (/image\/(jpe?g|png)/.test(mime)) {
               let img = await m.download()
               if (!img) return
               client.sendSticker(m.chat, img, m, {
                  packname: setting.sk_pack,
                  author: setting.sk_author
               })
            } else if (/video/.test(mime)) {
               if (m.msg.seconds > 10) return
               let img = await m.download()
               if (!img) return
               client.sendSticker(m.chat, img, m, {
                  packname: setting.sk_pack,
                  author: setting.sk_author
               })
            }
         }
      } catch (e) {
         console.log(e)
         return client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   group: true,
   cache: true,
   location: __filename
}