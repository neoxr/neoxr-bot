export const run = {
   usage: ['video'],
   hidden: ['playvid', 'playvideo'],
   use: 'query',
   category: 'downloader',
   async: async (m, {
      client,
      limitter,
      text,
      isPrefix,
      command,
      Config,
      users,
      Utils
   }) => {
      try {
         if (!text) return client.reply(m.chat, Utils.example(isPrefix, command, 'lathi'), m)
         client.sendReact(m.chat, '🕒', m.key)
         var json = await Api.neoxr('/video', {
            q: text
         })
         if (!json.status) return client.reply(m.chat, Utils.jsonFormat(json), m)
         let caption = `乂  *Y T - V I D E O*\n\n`
         caption += `   ◦  *Title* : ${json.title}\n`
         caption += `   ◦  *Size* : ${json.data.size}\n`
         caption += `   ◦  *Duration* : ${json.duration}\n`
         caption += `   ◦  *Bitrate* : ${json.data.quality}\n\n`
         caption += global.footer
         const chSize = Utils.sizeLimit(json.data.size, users.premium ? Config.max_upload : Config.max_upload_free)
         const isOver = users.premium ? `💀 File size (${json.data.size}) exceeds the maximum limit.` : `⚠️ File size (${json.data.size}), you can only download files with a maximum size of ${Config.max_upload_free} MB and for premium users a maximum of ${Config.max_upload} MB.`
         if (chSize.oversize) return client.reply(m.chat, isOver, m)
         let isSize = (json.data.size).replace(/MB/g, '').trim()
         if (isSize > 99) return client.sendFile(m.chat, json.data.url, json.data.filename, caption, m, {
            document: true
         }, {
            jpegThumbnail: await Utils.generateImageThumbnail(json.thumbnail)
         })
         client.sendFile(m.chat, json.data.url, json.data.filename, caption, m)
         limitter()
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   restrict: true,
   limit: true
}