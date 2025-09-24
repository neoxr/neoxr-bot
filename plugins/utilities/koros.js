export const run = {
   usage: ['koros'],
   use: 'query & reply media',
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
            let img = await client.downloadMediaMessage(q)
            if (!/image/.test(type)) return client.reply(m.chat, Utils.texted('bold', `Stress ??`), m)
            client.sendReact(m.chat, '🕒', m.key)
            const srv = await Scraper.uploadImageV2(img)
            if (!srv.status) return m.reply(Utils.jsonFormat(srv))
            const json = await Api.neoxr('/koros', {
               image: srv.data.url,
               q: text ? text : (m.quoted && m.quoted.text) ? m.quoted.text : 'deskripsikan tentang foto ini'
            })
            if (!json.status) return m.reply(Utils.jsonFormat(json))
            let caption = `*Prompt* : ${json.data.question}\n\n`
            caption += `—\n`
            caption += `${json.data.description}`
            client.sendFile(m.chat, json.data.image, '', caption, m)
         } else {
            let q = m.quoted ? m.quoted : m
            let mime = (q.msg || q).mimetype || ''
            if (!/image\/(jpe?g|png)/.test(mime)) return client.reply(m.chat, Utils.texted('bold', `Stress ??`), m)
            let img = await q.download()
            if (!img) return client.reply(m.chat, global.status.wrong, m)
            client.sendReact(m.chat, '🕒', m.key)
            const srv = await Scraper.uploadImageV2(img)
            if (!srv.status) return m.reply(Utils.jsonFormat(srv))
            const json = await Api.neoxr('/koros', {
               image: srv.data.url,
               q: text ? text : (m.quoted && m.quoted.text) ? m.quoted.text : 'deskripsikan tentang foto ini'
            })
            if (!json.status) return m.reply(Utils.jsonFormat(json))
            let caption = `*Prompt* : ${json.data.question}\n\n`
            caption += `—\n`
            caption += `${json.data.description}`
            client.sendFile(m.chat, json.data.image, '', caption, m)
         }
      } catch (e) {
         console.log(e)
         return client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true
}