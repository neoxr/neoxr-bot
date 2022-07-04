const { yta } = require('../../lib/y2mate')
const yt = require('@citoyasha/yt-search')
exports.run = {
   usage: ['play'],
   async: async (m, {
      client,
      text,
      isPrefix,
      command
   }) => {
      try {
         if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'lathi'), m)
         const search = await yt.search(text, 1)
         if (!search || search.length == 0) return client.reply(m.chat, global.status.fail, m)
         const {
            dl_link,
            thumb,
            title,
            filesizeF
         } = await yta(search[0].link)
         if (!dl_link) return client.reply(m.chat, global.status.fail, m)
         let caption = `◦  *Title* : ${title}\n`
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
      } catch (e) {
         console.log(e)
         return client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   cache: true,
   location: __filename
}