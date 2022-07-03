exports.run = {
   regex: /^(?:https?:\/\/)?(?:www\.|vt\.|vm\.|t\.)?(?:tiktok\.com\/)(?:\S+)?$/,
   async: async (m, {
      client,
      body,
      users,
      setting,
      prefixes
   }) => {
      try {
         const regex = /^(?:https?:\/\/)?(?:www\.|vt\.|vm\.|t\.)?(?:tiktok\.com\/)(?:\S+)?$/;
         const extract = body ? Func.generateLink(body) : null
         if (extract) {
            const links = extract.filter(v => Func.ttFixed(v).match(regex))
            if (links.length != 0) {
               client.reply(m.chat, global.status.getdata, m)
               let old = new Date()
               Func.hitstat('tiktok', m.sender)
               links.map(async link => {
                  let json = await Api.tiktok(Func.ttFixed(link))
                  if (!json.status) return client.reply(m.chat, Func.jsonFormat(json), m)
                  client.sendFile(m.chat, json.data.video, '', `🍟 *Fetching* : ${((new Date - old) * 1)} ms`, m)
               })
            }
         }
      } catch (e) {
         return client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   download: true
}