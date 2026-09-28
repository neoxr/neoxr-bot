export const run = {
   regex: /^(?:https?:\/\/)?(?:www\.)?(?:instagram\.com\/)(?:stories\/)(?:\S+)?$/i,
   async: async (m, {
      client,
      body,
      users,
      Utils,
      limitter
   }) => {
      try {
         const rawText = m.quoted?.text || body || ''
         const extract = rawText ? Utils.generateLink(rawText) : null
         if (!extract) return

         const regex = /instagram\.com\/stories\//i
         const links = extract.filter(v => regex.test(v))
         if (!links.length) return

         await client.sendReact(m.chat, '🕒', m.key)
         const old = Date.now()
         Utils.hitstat('igs', m.sender)

         for (const link of links) {
            const json = await Api.neoxr('/ig', {
               url: link
            })
            if (!json.status) {
               const username = link.split('/')[4] ? `@${link.split('/')[4]}` : 'story'
               return client.reply(m.chat, `❌ Failed to fetch story : [ ${username} ]`, m)
            }

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
