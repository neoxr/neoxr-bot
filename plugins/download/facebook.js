exports.run = {
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
      Scraper,
      env,
      Func
   }) => {
      try {
         if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'https://fb.watch/7B5KBCgdO3'), m)
         if (!args[0].match(/(?:https?:\/\/(web\.|www\.|m\.)?(facebook|fb)\.(com|watch)\S+)?$/)) return client.reply(m.chat, global.status.invalid, m)
         client.sendReact(m.chat, '🕒', m.key)
         
         const json = await Func.fetchJson(`https://api.betabotz.eu.org/api/download/fbdown?url=${encodeURIComponent(args[0])}&apikey=beta-Ibrahim1209`);
         if (!json.status) return client.reply(m.chat, Func.jsonFormat(json), m)
         
         let result = json.result.find(v => v.resolution === '720p (HD)')
         if (result) {
            const size = await Func.getSize(result._url)
            const chSize = Func.sizeLimit(size, users.premium ? env.max_upload : env.max_upload_free)
            const isOver = users.premium ? `💀 File size (${size}) exceeds the maximum limit, download it by yourself via this link : ${await (await Scraper.shorten(result._url)).data.url}` : `⚠️ File size (${size}), you can only download files with a maximum size of ${env.max_upload_free} MB and for premium users a maximum of ${env.max_upload} MB.`
            if (chSize.oversize) return client.reply(m.chat, isOver, m)
            client.sendFile(m.chat, result._url, Func.filename('mp4'), `◦ *Quality* : HD`, m)
         } else {
            result = json.result.find(v => v.resolution === '360p (SD)')
            if (!result) return client.reply(m.chat, global.status.fail, m)
            const size = await Func.getSize(result._url)
            const chSize = Func.sizeLimit(size, users.premium ? env.max_upload : env.max_upload_free)
            const isOver = users.premium ? `💀 File size (${size}) exceeds the maximum limit, download it by yourself via this link : ${await (await Scraper.shorten(result._url)).data.url}` : `⚠️ File size (${size}), you can only download files with a maximum size of ${env.max_upload_free} MB and for premium users a maximum of ${env.max_upload} MB.`
            if (chSize.oversize) return client.reply(m.chat, isOver, m)
            client.sendFile(m.chat, result._url, Func.filename('mp4'), `◦ *Quality* : SD`, m)
         }
      } catch (e) {
         console.log(e)
         return client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true,
   cache: true,
   location: __filename
}
