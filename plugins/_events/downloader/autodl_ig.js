export const run = {
   regex: /^(?:https?:\/\/)?(?:www\.)?(?:instagram\.com\/)(?:tv\/|p\/|reel\/)(?:\S+)?$/i,
   async: async (m, {
      client,
      body,
      users,
      Utils,
      limitter
   }) => {
      try {
         const extract = body ? Utils.generateLink(body) : null
         if (!extract) return

         const regex = /instagram\.com\/(tv|p|reel)\//i
         const links = extract.filter(v => regex.test(Utils.igFixed ? Utils.igFixed(v) : v))
         if (!links.length) return

         await client.sendReact(m.chat, '🕒', m.key)
         const old = Date.now()
         Utils.hitstat('ig', m.sender)

         for (const link of links) {
            const json = await Api.neoxr('/ig', {
               url: Utils.igFixed ? Utils.igFixed(link) : link
            })
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
         }
         limitter()
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   limit: true,
   download: true
}
