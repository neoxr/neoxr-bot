exports.run = {
   regex: /^(?:https?:\/\/)?(?:www\.|m\.|music\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w\-_]+)\&?/,
   async: async (m, {
      client,
      body,
      users,
      setting
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
               Func.hitstat('ytmp4', m.sender)
               links.map(async link => {
                  const json = await Func.fetchJson('https://yt.nxr.my.id/yt2?url=' + link + '&type=video')
                  if (!json.status || !json.data.url) return client.reply(m.chat, global.status.fail, m)
                  let caption = `乂  *Y T - M P 4*\n\n`
                  caption += `	◦  *Title* : ${json.title}\n`
                  caption += `	◦  *Size* : ${json.data.size}\n`
                  caption += `	◦  *Duration* : ${json.duration}\n`
                  caption += `	◦  *Quality* : ${json.data.quality}\n\n`
                  caption += global.footer
                  let chSize = Func.sizeLimit(json.data.size, global.max_upload)
                  if (chSize.oversize) return client.reply(m.chat, `💀 File size (${json.data.size}) exceeds the maximum limit, download it by yourself via this link : ${await (await scrap.shorten(json.data.url)).data.url}`, m)
                  let isSize = (json.data.size).replace(/MB/g, '').trim()
                  if (isSize > 99) return client.sendMessageModify(m.chat, caption, m, {
                     largeThumb: true,
                     thumbnail: await Func.fetchBuffer(json.thumbnail)
                  }).then(async () => await client.sendFile(m.chat, json.data.url, json.data.filename, '', m, {
                     document: true
                  }))
                  client.sendFile(m.chat, json.data.url, json.data.filename, caption, m)
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