exports.run = {
   regex: /^(?:https?:\/\/)?(?:www\.)?(?:instagram\.com\/)(?:tv\/|p\/|reel\/)(?:\S+)?$/,
   async: async (m, {
      client,
      body,
      users,
      setting,
   }) => {
      try {
         const regex = /^(?:https?:\/\/)?(?:www\.)?(?:instagram\.com\/)(?:tv\/|p\/|reel\/)(?:\S+)?$/;
         const extract = body ? Func.generateLink(body) : null
         if (extract) {
            const links = extract.filter(v => Func.igFixed(v).match(regex))
            if (links.length != 0) {
               client.reply(m.chat, global.status.getdata, m)
               let old = new Date()
               Func.hitstat('ig', m.sender)
               links.map(async link => {
                  let json = await Api.ig(Func.igFixed(link))
                  if (!json.status) return client.reply(m.chat, Func.jsonFormat(json), m)
                  json.data.map(async v => {
                     client.sendFile(m.chat, v.url, '', `🍟 *Fetching* : ${((new Date - old) * 1)} ms`, m)
                     await Func.delay(1500)
                  })
               })
            }
         }
      } catch (e) {
         return client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   download: true
}