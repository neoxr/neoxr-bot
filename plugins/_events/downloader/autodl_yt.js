export const run = {
   regex: /^(?:https?:\/\/)?(?:www\.|m\.|music\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w\-_]+)\&?/,
   async: async (m, {
      client,
      body,
      users,
      Config,
      Utils
   }) => {
      try {
         const regex = /^(?:https?:\/\/)?(?:www\.|m\.|music\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w\-_]+)\&?/;
         const extract = body ? Utils.generateLink(body) : null
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
               Utils.hitstat('ytmp4', m.sender)
               links.map(async link => {
                  var json = await Api.neoxr('/youtube', {
                     url: link,
                     type: 'video',
                     quality: '720p'
                  })
                  if (!json.status) {
                     var json = await Api.neoxr('/youtube', {
                        url: link,
                        type: 'video',
                        quality: '480p'
                     })
                  }
                  if (!json.status) return client.reply(m.chat, Utils.jsonFormat(json), m)
                  let caption = `乂  *Y T - M P 4*\n\n`
                  caption += `	◦  *Title* : ${json.title}\n`
                  caption += `	◦  *Size* : ${json.data.size}\n`
                  caption += `	◦  *Duration* : ${json.duration}\n`
                  caption += `	◦  *Quality* : ${json.data.quality}\n\n`
                  caption += global.footer
                  const chSize = Utils.sizeLimit(json.data.size, users.premium ? Config.max_upload : Config.max_upload_free)
                  const isOver = users.premium ? `💀 File size (${json.data.size}) exceeds the maximum limit.` : `⚠️ File size (${json.data.size}), you can only download files with a maximum size of ${Config.max_upload_free} MB and for premium users a maximum of ${Config.max_upload} MB.`
                  if (chSize.oversize) return client.reply(m.chat, isOver, m)
                  let isSize = (json.data.size).replace(/MB/g, '').trim()
                  if (isSize > 99) return client.sendMessageModify(m.chat, caption, m, {
                     largeThumb: true,
                     thumbnail: await Utils.fetchAsBuffer(json.thumbnail)
                  }).then(async () => {
                     await client.sendFile(m.chat, json.data.buffer, json.data.filename, caption, m, {
                        document: true
                     })
                  })
                  client.sendFile(m.chat, json.data.buffer, json.data.filename, caption, m)
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