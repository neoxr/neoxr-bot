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
      Utils,
      limitter
   }) => {
      try {
         const [url] = args || []
         if (!url) return client.reply(m.chat, Utils.example(isPrefix, command, 'https://www.instagram.com/p/CK0tLXyAzEI'), m)
         if (!/(https?:\/\/(?:www\.)?instagram\.com)/i.test(url)) return client.reply(m.chat, global.status.invalid, m)

         await client.sendReact(m.chat, '🕒', m.key)
         const old = Date.now()

         const json = await Api.neoxr('/ig', { url })
         if (!json.status) return client.reply(m.chat, `❌ ${json.msg || 'An error occurred while processing the data.'}`, m)

         const files = json.data.map(v => ({
            url: v.url,
            type: v.type === 'mp4' ? 'video' : 'image'
         }))

         if (files.length === 1) {
            limitter()
            return client.sendFile(m.chat, files[0].url, Utils.filename(files[0].type === 'video' ? 'mp4' : 'jpg'), `🍟 *Fetching* : ${Date.now() - old} ms`, m)
         }

         client.sendAlbumMessage(m.chat, files, m)
         limitter()
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   limit: true
}
