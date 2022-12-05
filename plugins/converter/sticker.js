exports.run = {
   usage: ['sticker'],
   hidden: ['s', 'sk', 'stiker', 'sgif'],
   use: 'query / reply media',
   category: 'converter',
   async: async (m, {
      client,
      text,
      isPrefix,
      command
   }) => {
      try {
         let exif = global.db.setting
         if (text) {
            // if (m.isGroup) return client.reply(m.chat, global.status.private, m)
            let json = await Api.sticker(text)
            if (!json.status) return client.reply(m.chat, global.status.fail, m)
            client.sendReact(m.chat, '🕒', m.key)
            if (text.match('getstickerpack.com')) {
               for (let i = 0; i < json.data.length; i++) {
                  client.sendSticker(m.chat, await Func.fetchBuffer(json.data[i].url), m, {
                     packname: exif.sk_pack,
                     author: exif.sk_author
                  })
                  await Func.delay(2000)
               }
               await client.reply(m.chat, Func.texted('bold', `✅ Done, all stickers converted successfully.`), m)
            } else {
               let rows = []
               json.data.map(async (v, i) => {
                  rows.push({
                     title: v.name,
                     rowId: `${isPrefix + command} ${v.url}`,
                     description: ``
                  })
               })
               client.sendList(m.chat, '', `Showing search results for : “${text}”, choose the sticker you want to convert. 🍟`, '', 'Tap!', [{
                  rows
               }], m)
            }
         } else {
            if (m.quoted ? m.quoted.message : m.msg.viewOnce) {
               let type = m.quoted ? Object.keys(m.quoted.message)[0] : m.mtype
               let q = m.quoted ? m.quoted.message[type] : m.msg
               let img = await client.downloadMediaMessage(q)
               if (/video/.test(type)) {
                  if (q.seconds > 10) return client.reply(m.chat, Func.texted('bold', `🚩 Maximum video duration is 10 seconds.`), m)
                  return await client.sendSticker(m.chat, img, m, {
                     packname: exif.sk_pack,
                     author: exif.sk_author
                  })
               } else if (/image/.test(type)) {
                  return await client.sendSticker(m.chat, img, m, {
                     packname: exif.sk_pack,
                     author: exif.sk_author
                  })
               }
            } else {
               let q = m.quoted ? m.quoted : m
               let mime = (q.msg || q).mimetype || ''
               if (/image\/(jpe?g|png)/.test(mime)) {
                  let img = await q.download()
                  if (!img) return client.reply(m.chat, global.status.wrong, m)
                  return await client.sendSticker(m.chat, img, m, {
                     packname: exif.sk_pack,
                     author: exif.sk_author
                  })
               } else if (/video/.test(mime)) {
                  if ((q.msg || q).seconds > 10) return client.reply(m.chat, Func.texted('bold', `🚩 Maximum video duration is 10 seconds.`), m)
                  let img = await q.download()
                  if (!img) return client.reply(m.chat, global.status.wrong, m)
                  return await client.sendSticker(m.chat, img, m, {
                     packname: exif.sk_pack,
                     author: exif.sk_author
                  })
               } else client.reply(m.chat, Func.texted('bold', `Stress ??`), m)
            }
         }
      } catch (e) {
         console.log(e)
         return client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false
}