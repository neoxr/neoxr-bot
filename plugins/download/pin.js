export const run = {
   usage: ['pin'],
   hidden: ['pinterest'],
   use: 'link or query',
   category: 'downloader',
   async: async (m, {
      client,
      args,
      text,
      isPrefix,
      command,
      Utils
   }) => {
      try {
         if (!text) return client.reply(m.chat, Utils.example(isPrefix, command, 'https://pin.it/6oMTJmFiq'), m)
         client.sendReact(m.chat, '🕒', m.key)
         let old = new Date()
         if (Utils.isUrl(text.trim())) {
            if (!text.match(/pin(?:terest)?(?:\.it|\.com)/)) return m.reply(global.status.invalid)
            const [url] = args
            const json = await Api.neoxr('/pin', { url })
            if (!json.status) return client.reply(m.chat, Utils.jsonFormat(json), m)
            if (json.data?.length === 1) return client.sendFile(m.chat, json.data[0].url, '', `🍟 *Fetching* : ${((new Date - old) * 1)} ms`, m)
            const files = json.data.map(v => ({ url: v.url }))
            client.sendAlbumMessage(m.chat, files, m)
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