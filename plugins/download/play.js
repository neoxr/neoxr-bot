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
      setting,
      Config,
      limitter,
      Utils
   }) => {
      try {
         if (!text) return client.reply(m.chat, Utils.example(isPrefix, command, 'lathi'), m)
         if (Utils.isUrl(text.trim())) return client.reply(m.chat, '❌ This command only accepts query keywords, not a URL.', m)

         await client.sendReact(m.chat, '🕒', m.key)
         const json = await Api.neoxr('/play', { q: text.trim() })
         if (!json.status) return client.reply(m.chat, `❌ ${json.msg || 'An error occurred while processing the data.'}`, m)

         let caption = `乂  *Y T - P L A Y*\n\n`
         caption += `   ◦  *Title* : ${json.title}\n`
         caption += `   ◦  *Size* : ${json.data.size}\n`
         caption += `   ◦  *Duration* : ${json.duration}\n`
         caption += `   ◦  *Bitrate* : ${json.data.quality}\n\n`
         caption += global.footer

         const chSize = Utils.sizeLimit(json.data.size, users.premium ? Config.max_upload : Config.max_upload_free)
         if (chSize.oversize) {
            const isOver = users.premium
               ? `💀 File size (${json.data.size}) exceeds the maximum limit.`
               : `⚠️ File size (${json.data.size}), you can only download files with a maximum size of ${Config.max_upload_free} MB and for premium users a maximum of ${Config.max_upload} MB.`
            return client.reply(m.chat, isOver, m)
         }

         const icon = setting.icon ? (Utils.isUrl(setting.icon) ? setting.icon : Buffer.from(setting.icon, 'base64')) : null

         await client.sendMessageModify(m.chat, caption, m, {
            largeThumb: true,
            type: 'preview-link',
            ratio: 'landscape',
            thumbnail: json.thumbnail,
            icon
         })

         client.sendFile(m.chat, json.data.url, json.data.filename, '', m, {
            document: true
         })

         limitter()
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   limit: true,
   restrict: true
}
