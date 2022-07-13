const { decode } = require('html-entities')
const { yta, ytv } = require('../../lib/y2mate')
const yt = require('youtube-sr').default
exports.run = {
   usage: ['yta', 'ytv', 'ytmp3', 'ytmp4'],
   async: async (m, {
      client,
      args,
      isPrefix,
      command
   }) => {
      try {
         if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'https://youtu.be/zaRFmdtLhQ8'), m)
         if (!/^(?:https?:\/\/)?(?:www\.|m\.|music\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w\-_]+)\&?/.test(args[0])) return client.reply(m.chat, global.status.invalid, m)
         client.sendReact(m.chat, '🕒', m.key)
         const search = await yt.getVideo(args[0])
         if (!search) return client.reply(m.chat, global.status.fail, m)
         if (/yt?(a|mp3)/i.test(command)) {
            const {
               dl_link,
               thumb,
               title,
               filesizeF
            } = await yta(args[0])
            if (!dl_link) return client.reply(m.chat, global.status.fail, m)
            let caption = `乂  *Y T - M P 3*\n\n`
            caption += `	◦  *Title* : ${decode(title)}\n`
            caption += `	◦  *Size* : ${filesizeF}\n`
            caption += `	◦  *Duration* : ${search.durationFormatted}\n`
            caption += `	◦  *Bitrate* : 128kbps\n\n`
            caption += global.footer
            let chSize = Func.sizeLimit(filesizeF, global.max_upload)
            if (chSize.oversize) return client.reply(m.chat, `💀 File size (${filesizeF}) exceeds the maximum limit, download it by yourself via this link : ${await (await scrap.shorten(dl_link)).data.url}`, m)
            client.sendMessageModify(m.chat, caption, m, {
               title: '© neoxr-bot v2.2.0 (Public Bot)',
               largeThumb: true,
               thumbnail: await Func.fetchBuffer(thumb)
            }).then(() => {
               client.sendFile(m.chat, dl_link, decode(title) + '.mp3', '', m, {
                  document: true
               })
            })
         } else if (/yt?(v|mp4)/i.test(command)) {
            const {
               dl_link,
               thumb,
               title,
               filesizeF
            } = await ytv(args[0])
            if (!dl_link) return client.reply(m.chat, global.status.fail, m)
            let caption = `乂  *Y T - M P 4*\n\n`
            caption += `	◦  *Title* : ${decode(title)}\n`
            caption += `	◦  *Size* : ${filesizeF}\n`
            caption += `	◦  *Duration* : ${search.durationFormatted}\n`
            caption += `	◦  *Quality* : 480p\n\n`
            caption += global.footer
            let chSize = Func.sizeLimit(filesizeF, global.max_upload)
            if (chSize.oversize) return client.reply(m.chat, `💀 File size (${filesizeF}) exceeds the maximum limit, download it by yourself via this link : ${await (await scrap.shorten(dl_link)).data.url}`, m)
            let isSize = (filesizeF).replace(/MB/g, '').trim()
            if (isSize > 99) return client.sendMessageModify(m.chat, caption, m, {
               title: '© neoxr-bot v2.2.0 (Public Bot)',
               largeThumb: true,
               thumbnail: await Func.fetchBuffer(thumb)
            }).then(async () => await client.sendFile(m.chat, dl_link, decode(title) + '.mp4', '', m, {
               document: true
            }))
            client.sendFile(m.chat, dl_link, Func.filename('mp4'), caption, m)
         }
      } catch (e) {
         console.log(e)
         return client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   limit: true,
   cache: true,
   location: __filename
}