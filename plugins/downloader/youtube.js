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
      setting,
      Config,
      Utils,
      limitter
   }) => {
      try {
         const [url] = args || []
         if (!url) return client.reply(m.chat, Utils.example(isPrefix, command, 'https://youtu.be/zaRFmdtLhQ8'), m)
         if (!/(?:youtu\.be\/|youtube\.com\/(?:watch|embed|shorts))/i.test(url)) return client.reply(m.chat, global.status.invalid, m)

         await client.sendReact(m.chat, '🕒', m.key)
         const isAudio = /yt?(a|mp3)/i.test(command)

         let json
         if (isAudio) {
            json = await Api.neoxr('/youtube', { url, type: 'audio', quality: '128kbps' })
         } else {
            json = await Api.neoxr('/youtube', { url, type: 'video', quality: '720p' })
            if (!json.status) json = await Api.neoxr('/youtube', { url, type: 'video', quality: '480p' })
         }

         if (!json.status) return client.reply(m.chat, `❌ ${json.msg || 'An error occurred while processing the data.'}`, m)

         let caption = `乂  *${isAudio ? 'Y T - P L A Y' : 'Y T - M P 4'}*\n\n`
         caption += `   ◦  *Title* : ${json.title}\n`
         caption += `   ◦  *Size* : ${json.data.size}\n`
         caption += `   ◦  *Duration* : ${json.duration}\n`
         caption += `   ◦  *${isAudio ? 'Bitrate' : 'Quality'}* : ${json.data.quality}\n\n`
         caption += global.footer

         const chSize = Utils.sizeLimit(json.data.size, users.premium ? Config.max_upload : Config.max_upload_free)
         if (chSize.oversize) {
            const isOver = users.premium
               ? `💀 File size (${json.data.size}) exceeds the maximum limit.`
               : `⚠️ File size (${json.data.size}), you can only download files with a maximum size of ${Config.max_upload_free} MB and for premium users a maximum of ${Config.max_upload} MB.`
            return client.reply(m.chat, isOver, m)
         }

         const isDoc = parseFloat(json.data.size) > 99
         const icon = setting.icon ? (Utils.isUrl(setting.icon) ? setting.icon : Buffer.from(setting.icon, 'base64')) : null

         if (isAudio) {
            const [thumb, jpegThumb] = await Promise.all([
               Utils.fetchAsBuffer(json.thumbnail),
               Utils.generateImageThumbnail(json.thumbnail)
            ])

            await client.sendMessageModify(m.chat, caption, m, {
               largeThumb: true,
               type: 'preview-link',
               thumbnail: thumb,
               icon
            })

            client.sendFile(m.chat, json.data.url, json.data.filename, '', m, {
               document: true,
               APIC: thumb
            }, {
               jpegThumbnail: jpegThumb
            })
         } else {
            if (isDoc) {
               await client.sendMessageModify(m.chat, caption, m, {
                  largeThumb: true,
                  type: 'preview-link',
                  thumbnail: await Utils.fetchAsBuffer(json.thumbnail),
                  icon
               })
            }

            client.sendFile(m.chat, json.data.url, json.data.filename, caption, m, {
               document: isDoc
            })
         }
         limitter()
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   limit: true
}
