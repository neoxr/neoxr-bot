const { decode } = require('html-entities')
const yt = require('usetube')
exports.run = {
   usage: ['play'],
   hidden: ['lagu', 'song'],
   use: 'query',
   category: 'downloader',
   async: async (m, {
      client,
      text,
      isPrefix,
      command
   }) => {
      try {
         if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'lathi'), m)
         client.sendReact(m.chat, '🕒', m.key)
         const search = await (await yt.searchVideo(text)).videos
         if (!search || search.length == 0) return client.reply(m.chat, global.status.fail, m)
         const json = await Func.fetchJson('https://api.nxr.my.id/api/yta?url=https://youtu.be/' + search[0].id)
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