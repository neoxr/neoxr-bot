export const run = {
   async: async (m, {
      client,
      groupSet,
      setting
   }) => {
      try {
         if (!groupSet?.autosticker || !/video|image/.test(m.mtype)) return

         const mime = client.message.get(m)?.mimetype || ''
         if (/video/.test(mime) && (m.msg?.seconds > 10)) return
         if (!/image\/(jpe?g|png)|video/.test(mime)) return

         const buffer = await m.download()
         if (!buffer) return

         client.sendSticker(m.chat, buffer, m, {
            packname: setting.sk_pack,
            author: setting.sk_author,
            meta: true
         })
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   group: true
}
