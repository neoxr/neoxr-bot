export const run = {
   regex: /^(?:https?:\/\/)?(?:www\.|vt\.|vm\.|t\.)?(?:tiktok\.com\/)(?:\S+)?$/,
   async: async (m, {
      client,
      body,
      users,
      Utils
   }) => {
      try {
         const regex = /^(?:https?:\/\/)?(?:www\.|vt\.|vm\.|t\.)?(?:tiktok\.com\/)(?:\S+)?$/;
         const extract = body ? Utils.generateLink(body) : null
         if (extract) {
            const links = extract.filter(v => Utils.ttFixed(v).match(regex) && !/tiktoklite/i.test(v))
            if (links.length != 0) {
               if (users.limit > 0) {
                  let limit = 1
                  if (users.limit >= limit) {
                     users.limit -= limit
                  } else return client.reply(m.chat, Utils.texted('bold', `🚩 Your limit is not enough to use this feature.`), m)
               }
               client.sendReact(m.chat, '🕒', m.key)
               let old = new Date()
               Utils.hitstat('tiktok', m.sender)
               links.map(async link => {
                  const json = await Api.neoxr('/tiktok', {
                     url: Utils.ttFixed(link)
                  })
                  if (!json.status) return m.reply(Utils.jsonFormat(json))
                  if (json.data.video) return client.sendFile(m.chat, json.data.video, 'video.mp4', `🍟 *Fetching* : ${((new Date - old) * 1)} ms`, m)
                  if (json.data.photo) {
                     for (let p of json.data.photo) {
                        client.sendFile(m.chat, p, 'image.jpg', `🍟 *Fetching* : ${((new Date - old) * 1)} ms`, m)
                        await Utils.delay(1500)
                     }
                  }
               })
            }
         }
      } catch (e) {
         return client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   limit: true,
   download: true
}