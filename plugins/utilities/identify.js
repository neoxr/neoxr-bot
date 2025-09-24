export const run = {
   usage: ['identify'],
   hidden: ['recog'],
   use: 'reply photo',
   category: 'utilities',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      Utils,
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
               const json = await Api.neoxr('/gemini-vision', {
                  image: image.data.url,
                  lang: 'id'
               })
               if (!json.status) return m.reply(Utils.jsonFormat(json))
               client.sendFile(m.chat, json.data.image, '', json.data.description, m)
            } else client.reply(m.chat, Utils.texted('bold', `🚩 Only for photo.`), m)
         } else {
            let q = m.quoted ? m.quoted : m
            let mime = (q.msg || q).mimetype || ''
            if (!mime) return client.reply(m.chat, Utils.texted('bold', `🚩 Reply photo.`), m)
            if (!/image\/(jpe?g|png)/.test(mime)) return client.reply(m.chat, Utils.texted('bold', `🚩 Only for photo.`), m)
            client.sendReact(m.chat, '🕒', m.key)
            let img = await q.download()
            let image = await Scraper.uploadImageV2(img)
            const json = await Api.neoxr('/gemini-vision', {
               image: image.data.url,
               lang: 'id'
            })
            if (!json.status) return m.reply(Utils.jsonFormat(json))
            client.sendFile(m.chat, json.data.image, '', json.data.description, m)
         }
      } catch (e) {
         return client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true
}