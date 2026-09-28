import { short } from '@neoxr/helper'

export const run = {
   usage: ['fb'],
   hidden: ['fbdl', 'fbvid'],
   use: 'link',
   category: 'downloader',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      users,
      Config,
      Utils,
      limitter
   }) => {
      try {
         const [url] = args || []
         if (!url) return client.reply(m.chat, Utils.example(isPrefix, command, 'https://fb.watch/7B5KBCgdO3'), m)
         if (!/(facebook\.com|fb\.watch)/i.test(url)) return client.reply(m.chat, global.status.invalid, m)

         await client.sendReact(m.chat, '🕒', m.key)

         const json = await Api.neoxr('/fb', { url })
         if (!json.status) return client.reply(m.chat, `❌ ${json.msg || 'An error occurred while processing the data.'}`, m)

         const medias = json.data?.media || []
         if (!medias.length) return client.reply(m.chat, global.status.fail, m)

         if (medias.length > 1) {
            const album = medias.map(v => ({
               url: v.url,
               type: v.type
            }))
            limitter()
            limitter()
            return client.sendAlbumMessage(m.chat, album, m)
         }

         const [media] = medias
         const size = await Utils.getSizeFromUrl(media.url)
         const chSize = Utils.sizeLimit(size, users.premium ? Config.max_upload : Config.max_upload_free)

         if (chSize.oversize) {
            const shortUrl = await (await short(media.url)).data.url
            const isOver = users.premium
               ? `💀 File size (${size}) exceeds the maximum limit, download it by yourself via this link : ${shortUrl}`
               : `⚠️ File size (${size}), you can only download files with a maximum size of ${Config.max_upload_free} MB and for premium users a maximum of ${Config.max_upload} MB.`
            return client.reply(m.chat, isOver, m)
         }

         client.sendFile(m.chat, media.url, '', '', m, {
            document: parseFloat(size) > 99
         })
         limitter()
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   limit: true
}
