export const run = {
   regex: /^(?:https?:\/\/)?(?:www\.|m\.|music\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w\-_]+)\&?/i,
   async: async (m, {
      client,
      body,
      users,
      setting,
      Config,
      Utils,
      limitter
   }) => {
      try {
         const extract = body ? Utils.generateLink(body) : null
         if (!extract) return

         const regex = /(?:youtu\.be\/|youtube\.com\/(?:watch|embed|shorts))/i
         const links = extract.filter(v => regex.test(v))
         if (!links.length) return

         await client.sendReact(m.chat, '🕒', m.key)
         Utils.hitstat('ytmp4', m.sender)

         for (const link of links) {
            let json = await Api.neoxr('/youtube', {
               url: link,
               type: 'video',
               quality: '720p'
            })

            if (!json.status) {
               json = await Api.neoxr('/youtube', {
                  url: link,
                  type: 'video',
                  quality: '480p'
               })
            }

            if (!json.status) return client.reply(m.chat, `❌ ${json.msg || 'An error occurred while processing the data.'}`, m)

            let caption = `乂  *Y T - M P 4*\n\n`
            caption += `   ◦  *Title* : ${json.title}\n`
            caption += `   ◦  *Size* : ${json.data.size}\n`
            caption += `   ◦  *Duration* : ${json.duration}\n`
            caption += `   ◦  *Quality* : ${json.data.quality}\n\n`
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

            if (isDoc) {
               await client.sendMessageModify(m.chat, caption, m, {
                  largeThumb: true,
                  type: 'preview-link',
                  ratio: 'landscape',
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
   limit: true,
   download: true
}
