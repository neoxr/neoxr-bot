export const run = {
   usage: ['ig'],
   hidden: ['igdl'],
   use: 'link',
   category: 'downloader',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      Utils
   }) => {
      try {
         const [url] = args || []
         if (!url) return client.reply(m.chat, Utils.example(isPrefix, command, 'https://www.instagram.com/p/CK0tLXyAzEI'), m)
         if (!/(https?:\/\/(?:www\.)?instagram\.com)/i.test(url)) return client.reply(m.chat, global.status.invalid, m)

         const old = Date.now()

         const json = await Api.neoxr('/ig', { url })
         if (!json.status) return client.reply(m.chat, `❌ ${json.msg || 'An error occurred while processing the data.'}`, m)

         for (const v of json.data) {
            const file = await Utils.getFile(v.url)
            const ext = /mp4|bin/.test(file.extension) ? 'mp4' : 'jpg'
            client.sendFile(m.chat, v.url, Utils.filename(ext), `🍟 *Fetching* : ${Date.now() - old} ms`, m)
            await Utils.delay(1500)
         }
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   limit: true
}