const { decode } = require('html-entities')
const { yta } = require('../../lib/y2mate')
const yt = require('youtube-sr').default
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
         client.sendReact(m.chat, '🕒', m.key)
         const search = await yt.search(text, {
            limit: 1,
            safeSearch: true
         })
         if (!search || search.length == 0) return client.reply(m.chat, global.status.fail, m)
         const {
            dl_link,
            thumb,
            title,
            filesizeF
         } = await yta('https://youtu.be/' + search[0].id)
         if (!dl_link) return client.reply(m.chat, global.status.fail, m)
         let caption = `乂  *Y T - P L A Y*\n\n`
         caption += `	◦  *Title* : ${decode(title)}\n`
         caption += `	◦  *Size* : ${filesizeF}\n`
         caption += `	◦  *Duration* : ${search[0].durationFormatted}\n`
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