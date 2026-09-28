export const run = {
   regex: /pin(?:terest)?(?:\.it|\.com)/i,
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

         const regex = /pin(?:terest)?(?:\.it|\.com)/i
         const links = extract.filter(v => regex.test(v))
         if (!links.length) return

         await client.sendReact(m.chat, '🕒', m.key)
         const old = Date.now()
         Utils.hitstat('pin', m.sender)

         for (const link of links) {
            const json = await Api.neoxr('/pin', {
               url: link
            })
            if (!json.status) return client.reply(m.chat, `❌ ${json.msg || 'An error occurred while processing the data.'}`, m)

            if (json.data?.length === 1) {
               client.sendFile(m.chat, json.data[0].url, '', `🍟 *Fetching* : ${Date.now() - old} ms`, m)
            } else if (json.data?.length > 1) {
               const files = json.data.map((v, i) => ({
                  url: v.url,
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
