const { decode } = require('html-entities')
const { yta, ytv } = require('../../lib/y2mate')
const yt = require('@citoyasha/yt-search')
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
         const search = await yt.search(args[0], 1)
         if (!search || search.length == 0) return client.reply(m.chat, global.status.fail, m)
         if (/yt?(a|mp3)/i.test(command)) {
            const {
               dl_link,
               thumb,
               title,
               filesizeF
            } = await yta(search[0].link)
            if (!dl_link) return client.reply(m.chat, global.status.fail, m)
            let caption = `◦  *Title* : ${decode(title)}\n`
            caption += `◦  *Size* : ${filesizeF}\n`
            caption += `◦  *Duration* : ${search[0].time}\n`
            caption += `◦  *Bitrate* : 128kbps`
            let chSize = Func.sizeLimit(filesizeF, global.max_upload)
            if (chSize.oversize) return client.reply(m.chat, `💀 File size (${filesizeF}) exceeds the maximum limit, download it by yourself via this link : ${await (await scrap.shorten(dl_link)).data.url}`, m)
            client.sendFile(m.chat, search[0].thumbnail, '', caption, m).then(() => {
               client.sendFile(m.chat, dl_link, title + '.mp3', '', m, {
                  document: true
               })
            })
         } else if (/yt?(v|mp4)/i.test(command)) {
            const {
               dl_link,
               thumb,
               title,
               filesizeF
            } = await ytv(search[0].link)
            if (!dl_link) return client.reply(m.chat, global.status.fail, m)
            let caption = `◦  *Title* : ${decode(title)}\n`
            caption += `◦  *Size* : ${filesizeF}\n`
            caption += `◦  *Duration* : ${search[0].time}\n`
            caption += `◦  *Quality* : 480p`
            let chSize = Func.sizeLimit(filesizeF, global.max_upload)
            if (chSize.oversize) return client.reply(m.chat, `💀 File size (${filesizeF}) exceeds the maximum limit, download it by yourself via this link : ${await (await scrap.shorten(dl_link)).data.url}`, m)
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