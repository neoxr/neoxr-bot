export const run = {
   regex: /^(?:https?:\/\/)?(?:www\.)?(?:instagram\.com\/)(?:stories\/)(?:\S+)?$/,
   async: async (m, {
      client,
      body,
      users,
      Utils
   }) => {
      try {
         const regex = /^(?:https?:\/\/)?(?:www\.)?(?:instagram\.com\/)(?:stories\/)(?:\S+)?$/;
         const extract =  (m.quoted && m.quoted.text) ? Utils.generateLink(m.quoted.text) : body ? Utils.generateLink(body) : null
         if (extract) {
            const links = extract.filter(v => v.match(regex))
            if (links.length != 0) {
               if (users.limit > 0) {
                  let limit = 1
                  if (users.limit >= limit) {
                     users.limit -= limit
                  } else return client.reply(m.chat, Utils.texted('bold', `🚩 Your limit is not enough to use this feature.`), m)
               }
               client.sendReact(m.chat, '🕒', m.key)
               let old = new Date()
               Utils.hitstat('igs', m.sender)
               links.map(async link => {
                  const json = await Api.neoxr('/ig-fetch', {
                  	url: link
                  })
                  if (!json.status) return client.reply(m.chat, `${global.status.fail} : [ @${link.split('/')[4]} ]`, m)
                  for (let v of json.data) {
                     const file = await Utils.getFile(v.url)
                     client.sendFile(m.chat, v.url, Utils.filename(/mp4|bin/.test(file.extension) ? 'mp4' : 'jpg'), `🍟 *Fetching* : ${((new Date - old) * 1)} ms`, m)
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
   download: true,
}