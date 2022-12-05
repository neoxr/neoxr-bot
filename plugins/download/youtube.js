exports.run = {
   usage: ['yt', 'ytmp3', 'ytmp4'],
   hidden: ['convert', 'yta', 'ytv'],
   use: 'link',
   category: 'downloader',
   async: async (m, {
      client,
      args,
      text,
      isPrefix,
      command
   }) => {
      try {
         if (command == 'yt') {
            if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'https://youtu.be/zaRFmdtLhQ8'), m)
            if (!/^(?:https?:\/\/)?(?:www\.|m\.|music\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w\-_]+)\&?/.test(args[0])) return client.reply(m.chat, global.status.invalid, m)
            client.sendReact(m.chat, '🕒', m.key)
            const json = await Func.fetchJson('https://yt.nxr.my.id/yt3?url=' + args[0])
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
               rowId: `${isPrefix}convert ${args[0]}|${json.id}|mp3|${v.k}|${v.size}|${json.token}|${json.expires}`,
               description: ``
            }))
            json.data.mp4.map(v => sections[1].rows.push({
               title: `${v.q} (${v.size})`,
               rowId: `${isPrefix}convert ${args[0]}|${json.id}|mp4|${v.k}|${v.size}|${json.token}|${json.expires}`,
               description: ``
            }))
            client.sendList(m.chat, '', `Choose type and quality 🍟`, '', 'Tap!', sections, m)
         } else if (command == 'convert') {
            if (!text) return
            const p = text.split`|`
            client.sendReact(m.chat, '🕒', m.key)
            const json = await Func.fetchJson(`https://yt.nxr.my.id/convert?url=${p[0]}&id=${p[1]}&ext=${p[2]}&quality=${p[3]}&size=${p[4]}&token=${p[5]}&expires=${p[6]}`)
            if (!json.status || !json.data.url) return client.reply(m.chat, global.status.fail, m)
            if (json.data.extension == 'mp3') {
               let caption = `乂  *Y T - P L A Y*\n\n`
               caption += `	◦  *Title* : ${json.title}\n`
               caption += `	◦  *Size* : ${json.data.size}\n`
               caption += `	◦  *Duration* : ${json.duration}\n`
               caption += `	◦  *Bitrate* : ${json.data.quality}\n\n`
               caption += global.footer
               let chSize = Func.sizeLimit(json.data.size, global.max_upload)
               if (chSize.oversize) return client.reply(m.chat, `💀 File size (${json.data.size}) exceeds the maximum limit, download it by yourself via this link : ${await (await scrap.shorten(json.data.url)).data.url}`, m)
               client.sendMessageModify(m.chat, caption, m, {
                  largeThumb: true,
                  thumbnail: await Func.fetchBuffer(json.thumbnail)
               }).then(async () => {
                  client.sendFile(m.chat, json.data.url, json.data.filename, '', m, {
                     document: true,
                     APIC: await Func.fetchBuffer(json.thumbnail)
                  })
               })
            } else {
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
            }
         } else if (/yt?(a|mp3)/i.test(command)) {
            if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'https://youtu.be/zaRFmdtLhQ8'), m)
            if (!/^(?:https?:\/\/)?(?:www\.|m\.|music\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w\-_]+)\&?/.test(args[0])) return client.reply(m.chat, global.status.invalid, m)
            client.sendReact(m.chat, '🕒', m.key)
            const json = await Func.fetchJson('https://yt.nxr.my.id/yt2?url=' + args[0] + '&type=audio')
            if (!json.status || !json.data.url) return client.reply(m.chat, global.status.fail, m)
            let caption = `乂  *Y T - P L A Y*\n\n`
            caption += `	◦  *Title* : ${json.title}\n`
            caption += `	◦  *Size* : ${json.data.size}\n`
            caption += `	◦  *Duration* : ${json.duration}\n`
            caption += `	◦  *Bitrate* : ${json.data.quality}\n\n`
            caption += global.footer
            let chSize = Func.sizeLimit(json.data.size, global.max_upload)
            if (chSize.oversize) return client.reply(m.chat, `💀 File size (${json.data.size}) exceeds the maximum limit, download it by yourself via this link : ${await (await scrap.shorten(json.data.url)).data.url}`, m)
            client.sendMessageModify(m.chat, caption, m, {
               largeThumb: true,
               thumbnail: await Func.fetchBuffer(json.thumbnail)
            }).then(async () => {
               client.sendFile(m.chat, json.data.url, json.data.filename, '', m, {
                  document: true,
                  APIC: await Func.fetchBuffer(json.thumbnail)
               })
            })
         } else if (/yt?(v|mp4)/i.test(command)) {
            if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'https://youtu.be/zaRFmdtLhQ8'), m)
            if (!/^(?:https?:\/\/)?(?:www\.|m\.|music\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w\-_]+)\&?/.test(args[0])) return client.reply(m.chat, global.status.invalid, m)
            client.sendReact(m.chat, '🕒', m.key)
            const json = await Func.fetchJson('https://yt.nxr.my.id/yt3?url=' + args[0])
            if (!json.status) return client.reply(m.chat, global.status.fail, m)
            let rows = []
            json.data.mp4.map(v => rows.push({
               title: `${v.q} (${v.size})`,
               rowId: `${isPrefix}convert ${args[0]}|${json.id}|mp4|${v.k}|${v.size}|${json.token}|${json.expires}`,
               description: ``
            }))
            client.sendList(m.chat, '', `Choose quality you want 🍟`, '', 'Tap!', [{
               rows
            }], m)
         }
      } catch (e) {
         return client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true,
   cache: true,
   location: __filename
}