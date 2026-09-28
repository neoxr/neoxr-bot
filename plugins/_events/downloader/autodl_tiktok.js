export const run = {
   regex: /^(?:https?:\/\/)?(?:www\.|vt\.|vm\.|t\.)?(?:tiktok\.com\/)(?:\S+)?$/i,
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

         const regex = /(?:tiktok\.com\/)/i
         const links = extract.filter(v => regex.test(Utils.ttFixed ? Utils.ttFixed(v) : v) && !/tiktoklite/i.test(v))
         if (!links.length) return

         await client.sendReact(m.chat, '🕒', m.key)
         const old = Date.now()
         Utils.hitstat('tiktok', m.sender)

         for (const link of links) {
            const json = await Api.neoxr('/tiktok', {
               url: Utils.ttFixed ? Utils.ttFixed(link) : link
            })
            if (!json.status) return client.reply(m.chat, `❌ ${json.msg || 'An error occurred while processing the data.'}`, m)

            if (json.data?.video) {
               client.sendFile(m.chat, json.data.video, 'video.mp4', `🍟 *Fetching* : ${Date.now() - old} ms`, m)
            } else if (json.data?.photo?.length) {
               const files = json.data.photo.map((v, i) => ({
                  url: v,
                  type: 'image',
                  caption: i === 0 ? `🍟 *Fetching* : ${Date.now() - old} ms` : ''
               }))
               client.sendAlbumMessage(m.chat, files, m)
            }
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
