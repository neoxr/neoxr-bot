export const run = {
   usage: ['pin'],
   use: 'link',
   category: 'downloader',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      Utils,
      limitter
   }) => {
      try {
         const [url] = args || []
         if (!url) return client.reply(m.chat, Utils.example(isPrefix, command, 'https://pin.it/6oMTJmFiq'), m)
         if (!/pin(?:terest)?(?:\.it|\.com)/i.test(url)) return client.reply(m.chat, global.status.invalid, m)

         await client.sendReact(m.chat, '🕒', m.key)
         const old = Date.now()

         const json = await Api.neoxr('/pin', {
            url
         })
         if (!json.status) return client.reply(m.chat, `❌ ${json.msg || 'An error occurred while processing the data.'}`, m)
         if (!json.data?.length) return client.reply(m.chat, '❌ No media found.', m)

         if (json.data.length === 1) {
            limitter()
            return client.sendFile(m.chat, json.data[0].url, '', `🍟 *Fetching* : ${Date.now() - old} ms`, m)
         }

         const files = json.data.map((v, i) => ({
            url: v.url,
            caption: i === 0 ? `🍟 *Fetching* : ${Date.now() - old} ms` : ''
         }))

         limitter()
         return client.sendAlbumMessage(m.chat, files, m)
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   limit: true
}
