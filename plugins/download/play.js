export const run = {
   usage: ['play'],
   use: 'query',
   category: 'downloader',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      users,
      Config,
      Utils
   }) => {
      try {
         if (!text) return client.reply(m.chat, Utils.example(isPrefix, command, 'lathi'), m)
         client.sendReact(m.chat, '🕒', m.key)
         var json = await Api.neoxr('/play', {
            q: text
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
            thumbnail: json.thumbnail
         }).then(async () => {
            client.sendFile(m.chat, json.data.url, json.data.filename, '', m, {
               document: true,
               APIC: await Utils.fetchAsBuffer(json.thumbnail)
            }, {
               jpegThumbnail: await Utils.generateImageThumbnail(json.thumbnail)
            })
         })
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   restrict: true
}