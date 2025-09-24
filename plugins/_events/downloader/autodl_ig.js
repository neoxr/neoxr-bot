export const run = {
   regex: /^(?:https?:\/\/)?(?:www\.)?(?:instagram\.com\/)(?:tv\/|p\/|reel\/)(?:\S+)?$/,
   async: async (m, {
      client,
      body,
      users,
      Utils
   }) => {
      try {
         const regex = /^(?:https?:\/\/)?(?:www\.)?(?:instagram\.com\/)(?:tv\/|p\/|reel\/)(?:\S+)?$/;
         const extract = body ? Utils.generateLink(body) : null
         if (extract) {
            const links = extract.filter(v => Utils.igFixed(v).match(regex))
            if (links.length != 0) {
               if (users.limit > 0) {
                  let limit = 1
                  if (users.limit >= limit) {
                     users.limit -= limit
                  } else return client.reply(m.chat, Utils.texted('bold', `🚩 Your limit is not enough to use this feature.`), m)
               }
               client.sendReact(m.chat, '🕒', m.key)
               let old = new Date()
               Utils.hitstat('ig', m.sender)
               links.map(async link => {
                  const json = await Api.neoxr('/ig', {
                  	url: Utils.igFixed(link)
                  })
                  if (!json.status) return client.reply(m.chat, Utils.jsonFormat(json), m)
                  for (let v of json.data) {
                     client.sendFile(m.chat, v.url, v.type == 'mp4' ? Utils.filename('mp4') : Utils.filename('jpg'), `🍟 *Fetching* : ${((new Date - old) * 1)} ms`, m)
                     await Utils.delay(1500)
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