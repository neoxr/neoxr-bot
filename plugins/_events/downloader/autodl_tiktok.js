exports.run = {
   regex: /^(?:https?:\/\/)?(?:www\.|vt\.|vm\.|t\.)?(?:tiktok\.com\/)(?:\S+)?$/,
   async: async (m, {
      client,
      body,
      users,
      setting,
      prefixes,
      Func,
   }) => {
      try {
         const regex = /^(?:https?:\/\/)?(?:www\.|vt\.|vm\.|t\.)?(?:tiktok\.com\/)(?:\S+)?$/;
         const extract = body ? Func.generateLink(body) : null
         if (extract) {
            const links = extract.filter(v => Func.ttFixed(v).match(regex))
            if (links.length != 0) {
               if (users.limit > 0) {
                  let limit = 1
                  if (users.limit >= limit) {
                     users.limit -= limit
                  } else return client.reply(m.chat, Func.texted('bold', `🚩 Your limit is not enough to use this feature.`), m)
               }
               client.sendReact(m.chat, '🕒', m.key)
               let old = new Date()
               Func.hitstat('tiktok', m.sender)
               links.map(async link => {
                  const json = await Api.neoxr('/tiktok', {
                  	url: Func.ttFixed(link)
                  })
                  if (!json.status) return client.reply(m.chat, Func.texted('bold', `🚩 Error! private videos or videos not available.`), m)
                  let caption = `乂  *T I K T O K*\n\n`
                  caption += `	◦  *Author* : ${json.data.author.nickname} (@${json.data.author.username})\n`
                  caption += `	◦  *Views* : ${Func.formatter(json.data.stats.play_count)}\n`
                  caption += `	◦  *Likes* : ${Func.formatter(json.data.stats.digg_count)}\n`
                  caption += `	◦  *Shares* : ${Func.formatter(json.data.stats.share_count)}\n`
                  caption += `	◦  *Comments* : ${Func.formatter(json.data.stats.comment_count)}\n`
                  caption += `	◦  *Duration* : ${Func.toTime(json.data.duration)}\n`
                  caption += `	◦  *Sound* : ${json.data.music.title} - ${json.data.music.author}\n`
                  caption += `	◦  *Caption* : ${json.data.caption || '-'}\n`
                  caption += `	◦  *Fetching* : ${((new Date - old) * 1)} ms\n\n`
                  caption += global.footer
                  if (json.data.video) return client.sendFile(m.chat, json.data.video, 'video.mp4', caption, m)
                  if (json.data.photo) {
                     for (let p of json.data.photo) {
                        client.sendFile(m.chat, p, 'image.jpg', caption, m)
                        await Func.delay(1500)
                     }
                  }
               })
            }
         }
      } catch (e) {
         return client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   limit: true,
   download: true
}