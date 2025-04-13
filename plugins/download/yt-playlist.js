exports.run = {
   usage: ['ytlist'],
   hidden: ['ytplaylist', 'playlist', 'getmp3', 'getmp4'],
   use: 'link',
   category: 'downloader',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      users,
      env,
      Func,
      Scraper
   }) => {
      try {
         client.ytplaylist = client.ytplaylist ? client.ytplaylist : []
         if (!args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'https://www.youtube.com/playlist?list=PLFIM0718LjIW-XBdVOerYgKegBtD6rSfD'), m)
         const check = client.ytplaylist.find(v => v.jid == m.sender)
         if (/get?(mp4|mp3)/.test(command) && !check && !isNaN(args[0])) return m.reply(Func.texted('bold', `🚩 Your session has expired / does not exist, do another search using the keywords you want.`))
         if (/get?(mp4|mp3)/.test(command) && check && !isNaN(args[0])) {
            if (Number(args[0]) > check.results.length) return m.reply(Func.texted('bold', `🚩 Exceed amount of data.`))
            client.sendReact(m.chat, '🕒', m.key)
            if (command === 'getmp3') {
               var json = await Api.neoxr('/youtube', {
                  url: check.results[Number(args[0]) - 1],
                  type: 'audio',
                  quality: '128kbps'
               })
               if (!json.status) return client.reply(m.chat, Func.jsonFormat(json), m)
               let caption = `乂  *Y T - P L A Y*\n\n`
               caption += `	◦  *Title* : ${json.title}\n`
               caption += `	◦  *Size* : ${json.data.size}\n`
               caption += `	◦  *Duration* : ${json.duration}\n`
               caption += `	◦  *Bitrate* : ${json.data.quality}\n\n`
               caption += global.footer
               const chSize = Func.sizeLimit(json.data.size, users.premium ? env.max_upload : env.max_upload_free)
               const isOver = users.premium ? `💀 File size (${json.data.size}) exceeds the maximum limit.` : `⚠️ File size (${json.data.size}), you can only download files with a maximum size of ${env.max_upload_free} MB and for premium users a maximum of ${env.max_upload} MB.`
               if (chSize.oversize) return client.reply(m.chat, isOver, m)
               client.sendMessageModify(m.chat, caption, m, {
                  largeThumb: true,
                  thumbnail: await Func.fetchBuffer(json.thumbnail)
               }).then(async () => {
                  client.sendFile(m.chat, json.data.url, json.data.filename, '', m, {
                     document: true,
                     APIC: await Func.fetchBuffer(json.thumbnail)
                  }, {
                     jpegThumbnail: await Func.createThumb(json.thumbnail)
                  })
               })
            } else if (command === 'getmp4') {
               var json = await Api.neoxr('/youtube', {
                  url: check.results[Number(args[0]) - 1],
                  type: 'video',
                  quality: '720p'
               })
               if (!json.status) {
                  var json = await Api.neoxr('/youtube', {
                     url: check.results[Number(args[0]) - 1],
                     type: 'video',
                     quality: '480p'
                  })
               }
               if (!json.status) return client.reply(m.chat, Func.jsonFormat(json), m)
               let caption = `乂  *Y T - M P 4*\n\n`
               caption += `	◦  *Title* : ${json.title}\n`
               caption += `	◦  *Size* : ${json.data.size}\n`
               caption += `	◦  *Duration* : ${json.duration}\n`
               caption += `	◦  *Quality* : ${json.data.quality}\n\n`
               caption += global.footer
               const chSize = Func.sizeLimit(json.data.size, users.premium ? env.max_upload : env.max_upload_free)
               const isOver = users.premium ? `💀 File size (${json.data.size}) exceeds the maximum limit.` : `⚠️ File size (${json.data.size}), you can only download files with a maximum size of ${env.max_upload_free} MB and for premium users a maximum of ${env.max_upload} MB.`
               if (chSize.oversize) return client.reply(m.chat, isOver, m)
               let isSize = (json.data.size).replace(/MB/g, '').trim()
               if (isSize > 99) return client.sendMessageModify(m.chat, caption, m, {
                  largeThumb: true,
                  thumbnail: await Func.fetchBuffer(json.thumbnail)
               }).then(async () => {
                  await client.sendFile(m.chat, json.data.url, json.data.filename, caption, m, {
                     document: true
                  }, {
                     jpegThumbnail: await Func.createThumb(json.thumbnail)
                  })
               })
               client.sendFile(m.chat, json.data.url, json.data.filename, caption, m)
            }
         } else if (['ytplaylist', 'playlist', 'ytlist'].includes(command)) {
            client.sendReact(m.chat, '🕒', m.key)
            const json = await Api.neoxr('/yt-playlist', {
               url: args[0]
            })
            if (!json.status) return client.reply(m.chat, Func.jsonFormat(json), m)
            if (!check) {
               client.ytplaylist.push({
                  jid: m.sender,
                  results: json.data.map(v => v.url),
                  created_at: new Date * 1
               })
            } else check.results = json.data.map(v => v.url)
            let p = `To download video use *${isPrefix}getmp4 number* and to get audio use *${isPrefix}getmp3 number*\n`
            p += `*Example* : ${isPrefix}getmp4 1\n\n`
            json.data.map((v, i) => {
               p += `*${i + 1}*. ${v.title}\n`
               p += `◦ *Link* : ${v.url}\n\n`
            }).join('\n\n')
            p += global.footer
            client.reply(m.chat, p, m)
         }
         setInterval(async () => {
            const session = client.ytplaylist.find(v => v.jid == m.sender)
            if (session && new Date - session.created_at > env.timeout) {
               Func.removeItem(client.ytplaylist, session)
            }
         }, 60_000)
      } catch (e) {
         client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true,
   cache: true,
   location: __filename
}