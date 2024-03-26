exports.run = {
   usage: ['reminiv2', 'hdv2'],
   use: 'reply photo',
   category: 'converter',
   async: async (m, {
      client,
      Func,
      Scraper
   }) => {
      try {
       if (m.quoted ? m.quoted.message : m.msg.viewOnce) {
          let type = m.quoted ? Object.keys(m.quoted.message)[0] : m.mtype
          let q = m.quoted ? m.quoted.message[type] : m.msg
          if (/image/.test(type)) {
             client.sendReact(m.chat, '🕒', m.key)
             let img = await client.downloadMediaMessage(q)
             let image = await Scraper.uploadImageV2(img)
             const json = await Func.fetchJson(`https://aemt.me/remini?url=${image.data.url}&resolusi=4`)
             let result = json.url
             client.sendFile(m.chat, result, 'image.png', '', m)
          } else client.reply(m.chat, Func.texted('bold', `🚩 Only for photo.`), m)
       } else {
         let q = m.quoted ? m.quoted : m
          let mime = (q.msg || q).mimetype || ''
          if (!mime) return client.reply(m.chat, Func.texted('bold', `🚩 Reply photo.`), m)
          if (!/image\/(jpe?g|png)/.test(mime)) return client.reply(m.chat, Func.texted('bold', `🚩 Only for photo.`), m)
          client.sendReact(m.chat, '🕒', m.key)
          let img = await q.download()
          let image = await Scraper.uploadImageV2(img)
          const json = await Func.fetchJson(`https://aemt.me/remini?url=${image.data.url}&resolusi=4`)
          let result = json.url
          client.sendFile(m.chat, result, 'image.png', '', m)
       }
    } catch (e) {
       return client.reply(m.chat, Func.jsonFormat(e), m)
    }
   },
   error: false,
   limit: true,
   premium: true,
   cache: true,
   location: __filename
 }
