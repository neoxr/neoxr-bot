export const run = {
   usage: ['gdrive'],
   use: 'link',
   category: 'downloader',
   async: async (m, {
      client,
      limitter,
      args,
      isPrefix,
      command,
      users,
      Config,
      Utils,
      Scraper
   }) => {
      const [argumen] = args
      try {
         if (!args || !argumen) return client.reply(m.chat, Utils.example(isPrefix, command, 'https://drive.google.com/file/d/1YTD7Ymux9puFNqu__5WPlYdFZHcGI3Wz/view?usp=drivesdk'), m)
         client.sendReact(m.chat, '🕒', m.key)
         const json = await Api.neoxr('/gdrive', {
            url: argumen
         })
         if (!json.status) return client.reply(m.chat, Utils.jsonFormat(json), m)
         const size = await Utils.getSizeFromUrl(json.data.url)
         const chSize = Utils.sizeLimit(size, users.premium ? Config.max_upload : Config.max_upload_free)
         const isOver = users.premium ? `💀 File size (${size}) exceeds the maximum limit, download it by yourself via this link : ${await (await Scraper.shorten(json.data.url)).data.url}` : `⚠️ File size (${size}), you can only download files with a maximum size of ${Config.max_upload_free} MB and for premium users a maximum of ${Config.max_upload} MB.`
         if (chSize.oversize) return client.reply(m.chat, isOver, m)
         client.sendFile(m.chat, json.data.url, '', '', m)
         limitter()
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   limit: true
}