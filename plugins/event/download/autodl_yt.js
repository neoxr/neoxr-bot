exports.run = {
   regex: /^(?:https?:\/\/)?(?:www\.|m\.|music\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w\-_]+)\&?/,
   async: async (m, {
      client,
      body,
      users,
      setting,
      prefixes
   }) => {
      try {
         const regex = /^(?:https?:\/\/)?(?:www\.|m\.|music\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w\-_]+)\&?/;
         const extract = body ? Func.generateLink(body) : null
         if (extract) {
            const links = extract.filter(v => v.match(regex))
            if (links.length != 0) {
               if (users.limit > 0) {
                  let limit = 1
                  if (users.limit >= limit) {
                     users.limit -= limit
                  } else return client.reply(m.chat, Func.texted('bold', `🚩 Your limit is not enough to use this feature.`), m)
               }
               client.sendReact(m.chat, '🕒', m.key)
               let old = new Date()
               Func.hitstat('yt', m.sender)
               links.map(async link => {
                  const json = await Func.fetchJson('https://yt.nxr.my.id/yt3?url=' + link)
                  if (!json.status) return client.reply(m.chat, global.status.fail, m)
                  let sections = [{
                     title: 'Audio',
                     rows: []
                  }, {
                     title: 'Video',
                     rows: []
                  }]
                  json.data.mp3.map(v => sections[0].rows.push({
                     title: `${v.q} (${v.size})`,
                     rowId: `${prefixes[0]}convert ${link}|${json.id}|mp3|${v.k}|${v.size}|${json.token}|${json.expires}`,
                     description: ``
                  }))
                  json.data.mp4.map(v => sections[1].rows.push({
                     title: `${v.q} (${v.size})`,
                     rowId: `${prefixes[0]}convert ${link}|${json.id}|mp4|${v.k}|${v.size}|${json.token}|${json.expires}`,
                     description: ``
                  }))
                  client.sendList(m.chat, '', `Choose type and quality 🍟`, '', 'Tap!', sections, m)
               })
            }
         }
      } catch (e) {
         console.log(e)
         return client.reply(m.chat, global.status.error, m)
      }
   },
   limit: true,
   download: true
}