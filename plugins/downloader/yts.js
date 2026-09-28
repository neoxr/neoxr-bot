import yts from 'yt-search'

const ytsSessions = []

export const run = {
   usage: ['ytsearch'],
   hidden: ['yts', 'ytfind', 'mp3', 'mp4'],
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
      Utils,
      limitter
   }) => {
      try {
         if (!text) return client.reply(m.chat, Utils.example(isPrefix, command, 'lathi'), m)

         const check = ytsSessions.find(v => v.jid === m.sender)
         const index = parseInt(text)

         if (/mp3|mp4/i.test(command)) {
            if (!check || isNaN(index)) return client.reply(m.chat, Utils.texted('bold', '❌ Session expired. Search again.'), m)
            if (index < 1 || index > check.results.length) return client.reply(m.chat, Utils.texted('bold', '❌ Invalid selection.'), m)

            await client.sendReact(m.chat, '🕒', m.key)
            const url = check.results[index - 1]
            const isVideo = command === 'mp4'

            let json = isVideo
               ? await Api.neoxr('/youtube', { url, type: 'video', quality: '720p' }).catch(() => null)
               : await Api.neoxr('/youtube', { url, type: 'audio', quality: '128kbps' }).catch(() => null)

            if (isVideo && !json?.status) {
               json = await Api.neoxr('/youtube', { url, type: 'video', quality: '480p' }).catch(() => null)
            }

            if (!json?.status || !json?.data) return client.reply(m.chat, `❌ ${json?.msg || 'An error occurred while processing the data.'}`, m)

            const size = json.data.size || '0MB'
            const chSize = Utils.sizeLimit(size, users.premium ? Config.max_upload : Config.max_upload_free)
            if (chSize.oversize) {
               const isOver = users.premium
                  ? `💀 File size (${size}) exceeds the maximum limit.`
                  : `⚠️ File size (${size}), you can only download files with a maximum size of ${Config.max_upload_free} MB and for premium users a maximum of ${Config.max_upload} MB.`
               return client.reply(m.chat, isOver, m)
            }

            const [thumb, jpeg] = await Promise.all([
               Utils.fetchAsBuffer(json.thumbnail).catch(() => null),
               Utils.generateImageThumbnail(json.thumbnail).catch(() => null)
            ])

            let caption = `乂  *Y T - ${command.toUpperCase().split('').join(' ')}*\n\n`
            caption += `   ◦  *Title* : ${json.title}\n`
            caption += `   ◦  *Size* : ${size}\n`
            caption += `   ◦  *Duration* : ${json.duration}\n`
            caption += `   ◦  *Quality* : ${json.data.quality}\n\n`
            caption += global.footer

            const icon = setting.icon ? (Utils.isUrl(setting.icon) ? setting.icon : Buffer.from(setting.icon, 'base64')) : null

           if (command === 'mp3') await client.sendMessageModify(m.chat, caption, m, {
               largeThumb: true,
               type: 'preview-link',
               thumbnail: thumb,
               icon
            })

            limitter()

            limitter()
            return client.sendFile(m.chat, json.data.url, json.data.filename, command === 'mp4' ? caption : '', m, {
               document: command === 'mp3',
               APIC: thumb
            }, {
               jpegThumbnail: jpeg
            })
         }

         if (Utils.isUrl(text.trim())) return client.reply(m.chat, '❌ This command only accepts query keywords, not a URL.', m)

         await client.sendReact(m.chat, '🕒', m.key)
         const res = await yts(text.trim()).catch(() => null)
         if (!res?.all?.length) return client.reply(m.chat, global.status.fail, m)

         const vids = res.all.filter(v => v.timestamp)
         if (!vids.length) return client.reply(m.chat, global.status.fail, m)

         const urls = vids.map(v => v.url)
         if (!check) ytsSessions.push({ jid: m.sender, results: urls, created_at: Date.now() })
         else Object.assign(check, { results: urls, created_at: Date.now() })

         let p = `To get audio use *${isPrefix}mp3 number* and video use *${isPrefix}mp4 number*\n*Example* : ${isPrefix}mp4 1\n\n`
         vids.forEach((v, i) => p += `*${i + 1}*. ${v.title}\n◦ *Duration* : ${v.timestamp}\n◦ *Views* : ${Utils.h2k(v.views || 0)}\n◦ *Link* : ${v.url}\n\n`)
         client.reply(m.chat, p + global.footer, m)

         setTimeout(() => {
            const session = ytsSessions.find(v => v.jid === m.sender)
            if (session) Utils.removeItem(ytsSessions, session)
         }, 60000)
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
