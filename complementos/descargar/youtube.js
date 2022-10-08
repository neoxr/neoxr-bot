const { decode } = require('html-entities')
exports.run = {
   usage: ['ytmp3', 'ytmp4'],
   hidden: ['yta', 'ytv'],
   use: 'link',
   category: 'downloader',
   async: async (m, {
      client,
      args,
      isPrefix,
      command
   }) => {
      try {
         if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'https://youtu.be/zaRFmdtLhQ8'), m)
         if (!/^(?:https?:\/\/)?(?:www\.|m\.|music\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w\-_]+)\&?/.test(args[0])) return client.reply(m.chat, global.status.invalid, m)
         client.sendReact(m.chat, '🕒👁', m.key)
         if (/yt?(a|mp3)/i.test(command)) {
            const json = await Func.fetchJson('https://api.nxr.my.id/api/yta?url=' + args[0])
            if (!json.status || !json.data.dl_link) return client.reply(m.chat, global.status.fail, m)
            let caption = `乂  *Y T - P L A Y*\n\n`
            caption += `	◦  *Title* : ${decode(json.data.title)}\n`
            caption += `	◦  *Size* : ${json.data.filesizeF}\n`
            caption += `	◦  *Duration* : ${json.data.duration}\n`
            caption += `	◦  *Bitrate* : 128kbps\n\n`
            caption += global.footer
            let chSize = Func.sizeLimit(json.data.filesizeF, global.max_upload)
            if (chSize.oversize) return client.reply(m.chat, `💀 File size (${json.data.filesizeF}) exceeds the maximum limit, download it by yourself via this link : ${await (await scrap.shorten(json.data.dl_link)).data.url}`, m)
            client.sendMessageModify(m.chat, caption, m, {
               largeThumb: true,
               thumbnail: await Func.fetchBuffer(json.data.thumb)
            }).then(async () => {
               client.sendFile(m.chat, json.data.dl_link, decode(json.data.title) + '.mp3', '', m, {
                  document: true,
                  APIC: await Func.fetchBuffer(json.data.thumb)
               })
            })
         } else if (/yt?(v|mp4)/i.test(command)) {
            const json = await Func.fetchJson('https://api.nxr.my.id/api/yta?url=https://youtu.be/' + args[0])
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
         }
      } catch (e) {
         return client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   limit: false,
   cache: true,
   location: __filename
}
