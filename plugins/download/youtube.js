export const run = {
   usage: ['ytmp3', 'ytmp4'],
   hidden: ['yta', 'ytv'],
   use: 'link',
   category: 'downloader',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      users,
      Config,
      Utils
   }) => {
      try {
         if (/yt?(a|mp3)/i.test(command)) {
            if (!args || !args[0]) return client.reply(m.chat, Utils.example(isPrefix, command, 'https://youtu.be/zaRFmdtLhQ8'), m)
            if (!/^(?:https?:\/\/)?(?:www\.|m\.|music\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w\-_]+)\&?/.test(args[0])) return client.reply(m.chat, global.status.invalid, m)
            client.sendReact(m.chat, '🕒', m.key)
            var json = await Api.neoxr('/youtube', {
               url: args[0],
               type: 'audio',
               quality: '128kbps'
            })
            if (!json.status) return client.reply(m.chat, Utils.jsonFormat(json), m)
            let caption = `乂  *Y T - P L A Y*\n\n`
            caption += `	◦  *Title* : ${json.title}\n`
            caption += `	◦  *Size* : ${json.data.size}\n`
            caption += `	◦  *Duration* : ${json.duration}\n`
            caption += `	◦  *Bitrate* : ${json.data.quality}\n\n`
            caption += global.footer
            const chSize = Utils.sizeLimit(json.data.size, users.premium ? Config.max_upload : Config.max_upload_free)
            const isOver = users.premium ? `💀 File size (${json.data.size}) exceeds the maximum limit.` : `⚠️ File size (${json.data.size}), you can only download files with a maximum size of ${Config.max_upload_free} MB and for premium users a maximum of ${Config.max_upload} MB.`
            if (chSize.oversize) return client.reply(m.chat, isOver, m)
            client.sendMessageModify(m.chat, caption, m, {
               largeThumb: true,
               thumbnail: await Utils.fetchAsBuffer(json.thumbnail)
            }).then(async () => {
               client.sendFile(m.chat, json.data.url, json.data.filename, '', m, {
                  document: true,
                  APIC: await Utils.fetchAsBuffer(json.thumbnail)
               }, {
                  jpegThumbnail: await Utils.generateImageThumbnail(json.thumbnail)
               })
            })
         } else if (/yt?(v|mp4)/i.test(command)) {
            if (!args || !args[0]) return client.reply(m.chat, Utils.example(isPrefix, command, 'https://youtu.be/zaRFmdtLhQ8'), m)
            if (!/^(?:https?:\/\/)?(?:www\.|m\.|music\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w\-_]+)\&?/.test(args[0])) return client.reply(m.chat, global.status.invalid, m)
            client.sendReact(m.chat, '🕒', m.key)
            var json = await Api.neoxr('/youtube', {
               url: args[0],
               type: 'video',
               quality: '720p'
            })
            if (!json.status) {
               var json = await Api.neoxr('/youtube', {
                  url: args[0],
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
               await client.sendFile(m.chat, json.data.url, json.data.filename, caption, m, {
                  document: true
               }, {
                  jpegThumbnail: await Utils.generateImageThumbnail(json.thumbnail)
               })
            })
            client.sendFile(m.chat, json.data.url, json.data.filename, caption, m)
         }
      } catch (e) {
         return client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true
}