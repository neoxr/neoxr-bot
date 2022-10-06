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
                  const json = await Func.fetchJson('https://api.nxr.my.id/api/yta?url=' + link)
                  if (!json.status || !json.data.dl_link) return client.reply(m.chat, global.status.fail, m)
                  let caption = `乂  *Y T - M P 4*\n\n`
                  caption += `	◦  *Title* : ${decode(json.data.title)}\n`
                  caption += `	◦  *Size* : ${json.data.filesizeF}\n`
                  caption += `	◦  *Duration* : ${json.data.duration}\n`
                  caption += `	◦  *Quality* : 480p\n\n`
                  caption += global.footer
                  let chSize = Func.sizeLimit(json.data.filesizeF, global.max_upload)
                  if (chSize.oversize) return client.reply(m.chat, `💀 File size (${json.data.filesizeF}) exceeds the maximum limit, download it by yourself via this link : ${await (await scrap.shorten(json.data.dl_link)).data.url}`, m)
                  let isSize = (json.data.filesizeF).replace(/MB/g, '').trim()
                  if (isSize > 99) return client.sendMessageModify(m.chat, caption, m, {
                     largeThumb: true,
                     thumbnail: await Func.fetchBuffer(json.data.thumb)
                  }).then(async () => await client.sendFile(m.chat, json.data.dl_link, decode(json.data.title) + '.mp4', '', m, {
                     document: true
                  }))
                  client.sendFile(m.chat, json.data.dl_link, Func.filename('mp4'), caption, m)
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