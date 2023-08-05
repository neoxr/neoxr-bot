exports.run = {
   usage: ['scrop'],
   use: 'style',
   category: 'converter',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      Func,
      Scraper
   }) => {
      try {
         let style = ["triangle","circle","pentagon","star","hexagon","octagon","spider","broken","love"]
         let print = `Use this feature based on the style below :\n\n`
         print += style.sort((a, b) => a.localeCompare(b)).map((v, i) => {
            if (i == 0) {
               return `┌  ◦  ${isPrefix + command} ${v}`
            } else if (i == style.sort((a, b) => a.localeCompare(b)).length - 1) {
               return `└  ◦  ${isPrefix + command} ${v}`
            } else {
               return `│  ◦  ${isPrefix + command} ${v}`
            }
         }).join('\n')
         print += `\n\n${global.footer}`
         if (!args || !args[0]) return client.sendFile(m.chat, 'https://iili.io/HtfsWdv.jpg', '', print, m)
         if (!style.includes(args[0].toLowerCase())) return client.sendFile(m.chat, 'https://iili.io/HtfsWdv.jpg', '', print, m)
         let exif = global.db.setting
         client.sendReact(m.chat, '🕒', m.key)
         if (m.quoted ? m.quoted.message : m.msg.viewOnce) {
            let type = m.quoted ? Object.keys(m.quoted.message)[0] : m.mtype
            let q = m.quoted ? m.quoted.message[type] : m.msg
            if (/image/.test(type)) {
               let img = await client.downloadMediaMessage(q)
               let json = await Scraper.uploadImage(img)
               let res = await Api.neoxr('/cropshape', {
                  image: json.data.url,
                  style: args[0].toLowerCase()
               })
               if (!res.status) return m.reply(Func.jsonFormat(res))
               client.sendSticker(m.chat, res.data.url, m, {
                  packname: exif.sk_pack,
                  author: exif.sk_author
               })
            } else client.reply(m.chat, Func.texted('bold', `🚩 Only for photo.`), m)
         } else {
            let q = m.quoted ? m.quoted : m
            let mime = (q.msg || q).mimetype || ''
            if (!mime) return client.reply(m.chat, Func.texted('bold', `🚩 Reply photo.`), m)
            if (!/image\/(jpe?g|png)/.test(mime)) return client.reply(m.chat, Func.texted('bold', `🚩 Only for photo.`), m)
            let img = await q.download()
            let json = await Scraper.uploadImage(img)
            let res = await Api.neoxr('/cropshape', {
               image: json.data.url,
               style: args[0].toLowerCase()
            })
            if (!res.status) return m.reply(Func.jsonFormat(res))
            client.sendSticker(m.chat, res.data.url, m, {
               packname: exif.sk_pack,
               author: exif.sk_author
            })
         }
      } catch (e) {
         return client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true,
   cache: true,
   location: __filename
}