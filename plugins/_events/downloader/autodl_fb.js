export const run = {
   regex: /(facebook\.com|fb\.watch)/i,
   async: async (m, {
      client,
      body,
      users,
      Config,
      Utils,
      Scraper,
      limitter
   }) => {
      try {
         const extract = body ? Utils.generateLink(body) : null
         if (!extract) return

         const links = extract.filter(v => /(facebook\.com|fb\.watch)/i.test(v))
         if (!links.length) return

         await client.sendReact(m.chat, '🕒', m.key)
         Utils.hitstat('fb', m.sender)

         for (const link of links) {
            const json = await Api.neoxr('/fb', {
               url: Utils.ttFixed ? Utils.ttFixed(link) : link
            })
            if (!json.status) return client.reply(m.chat, `❌ ${json.msg || 'An error occurred while processing the data.'}`, m)

            const result = json.data.find(v => v.quality === 'HD' && v.response == 200) ||
               json.data.find(v => v.quality === 'SD' && v.response == 200)
            if (!result) return client.reply(m.chat, global.status.fail, m)

            const size = await Utils.getSizeFromUrl(result.url)
            const chSize = Utils.sizeLimit(size, users.premium ? Config.max_upload : Config.max_upload_free)

            if (chSize.oversize) {
               const shortUrl = await (await Scraper.shorten(result.url)).data.url
               const isOver = users.premium
                  ? `💀 File size (${size}) exceeds the maximum limit, download it by yourself via this link : ${shortUrl}`
                  : `⚠️ File size (${size}), you can only download files with a maximum size of ${Config.max_upload_free} MB and for premium users a maximum of ${Config.max_upload} MB.`
               return client.reply(m.chat, isOver, m)
            }

            client.sendFile(m.chat, result.url, Utils.filename('mp4'), `◦ *Quality* : ${result.quality}`, m, {
               document: parseFloat(size) > 99
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
