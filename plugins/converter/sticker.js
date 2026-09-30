export const run = {
   usage: ['sticker'],
   hidden: ['s'],
   category: 'converter',
   async: async (m, {
      client,
      command,
      setting: exif,
      limitter,
      Utils
   }) => {
      try {
         const q = m?.quoted ?? m
         const mime = (client.message.get(q) ?? '')?.mimetype

         if (/image\/(jpe?g|png|webp)/.test(mime)) {
            const buffer = await q.download()
            if (!buffer) return client.reply(m.chat, global.status.wrong, m)
            await client.sendReact(m.chat, '🕒', m.key)
            client.sendSticker(m.chat, buffer, m, {
               packname: exif.sk_pack,
               author: exif.sk_author,
               meta: true,
               exclusive: true
            }).then(() => {
               m.react('✅')
               limitter()
            })
         } else if (/video/.test(mime)) {
            if (client.message.get(q).seconds > 10) return client.reply(m.chat, Utils.texted('bold', `❌ Maximum video duration is 10 seconds.`), m)
            const buffer = await q.download()
            if (!buffer) return client.reply(m.chat, global.status.wrong, m)
            await client.sendReact(m.chat, '🕒', m.key)
            client.sendSticker(m.chat, buffer, m, {
               packname: exif.sk_pack,
               author: exif.sk_author,
               meta: true,
               exclusive: true
            }).then(() => {
               m.react('✅')
               limitter()
            })
         } else client.reply(m.chat, Utils.texted('bold', `Stress ??`), m)
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   limit: true
}
