export const run = {
   usage: ['pin'],
   hidden: ['pinterest'],
   use: 'link / query',
   category: 'downloader',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      Utils
   }) => {
      try {
         if (!text) return client.reply(m.chat, Utils.example(isPrefix, command, 'https://pin.it/5fXaAWE'), m)
         client.sendReact(m.chat, '🕒', m.key)
         if (Utils.isUrl(text.trim())) {
            if (!text.match(/pin(?:terest)?(?:\.it|\.com)/)) return m.reply(global.status.invalid)
            const json = await Api.neoxr('/pin', {
               url: text.trim()
            })
            if (!json.status) return client.reply(m.chat, Utils.jsonFormat(json), m)
            if (/jpg|mp4/.test(json.data.type)) return client.sendFile(m.chat, json.data.url, '', '', m)
            if (json.data.type == 'gif') return client.sendFile(m.chat, json.data.url, '', ``, m, {
               gif: true
            })
         } else {
            const json = await Api.neoxr('/pinterest', {
               q: text.trim()
            })
            if (!json.status) return client.reply(m.chat, Utils.jsonFormat(json), m)
            const imgUrl = Utils.random(json.data)
            client.sendFile(m.chat, imgUrl, '', '', m)
         }
      } catch {
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   limit: true
}