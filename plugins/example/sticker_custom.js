export const run = {
   usage: ['stclock', 'stcprem', 'stcai'],
   category: 'example',
   async: async (m, {
      client,
      command,
      setting: exif,
      Utils
   }) => {
      try {
         const q = m.quoted ? m.quoted : m
         const mime = (q.msg || q).mimetype || ''
         if (/image\/(jpe?g|png|webp)/.test(mime)) {
            const buffer = await q.download()
            if (!buffer) return client.reply(m.chat, global.status.wrong, m)
            await client.sendReact(m.chat, '🕒', m.key)
            client.sendSticker(m.chat, buffer, m, {
               packname: exif.sk_pack,
               author: exif.sk_author,
               ...(command === 'stclock'
                  ? { lock: true }
                  : command === 'stcprem'
                     ? { premium: true }
                     : command === 'stcai'
                        ? { meta: true }
                        : {}
               )
            })
         } else if (/video/.test(mime)) {
            if ((q.msg || q).seconds > 10) return client.reply(m.chat, Utils.texted('bold', `🚩 Maximum video duration is 10 seconds.`), m)
            const buffer = await q.download()
            if (!buffer) return client.reply(m.chat, global.status.wrong, m)
            await client.sendReact(m.chat, '🕒', m.key)
            client.sendSticker(m.chat, buffer, m, {
               packname: exif.sk_pack,
               author: exif.sk_author,
               ...(command === 'stclock'
                  ? { lock: true }
                  : command === 'stcprem'
                     ? { premium: true }
                     : command === 'stcai'
                        ? { meta: true }
                        : {}
               )
            })
         } else client.reply(m.chat, Utils.texted('bold', `Stress ??`), m)
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false
}