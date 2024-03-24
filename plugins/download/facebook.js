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
      env,
      Func
   }) => {
      try {
         if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'https://fb.watch/7B5KBCgdO3'), m)
         if (!args[0].match(/(?:https?:\/\/(web\.|www\.|m\.)?(facebook|fb)\.(com|watch)\S+)?$/)) return client.reply(m.chat, global.status.invalid, m)
         client.sendReact(m.chat, '🕒', m.key)
         const json = await Api.neoxr('/fb', {
            url: args[0]
         })
         if (!json.status) return client.reply(m.chat, Func.jsonFormat(json), m)
         let result = json.data.find(v => v.quality == 'HD' && v.response == 200)
         if (result) {
            const size = await Func.getSize(result.url)
            const chSize = Func.sizeLimit(size, users.premium ? env.max_upload : env.max_upload_free)
            const isOver = users.premium ? `💀 File size (${size}) exceeds the maximum limit, download it by yourself via this link : ${await (await Scraper.shorten(result.url)).data.url}` : `⚠️ File size (${size}), you can only download files with a maximum size of ${env.max_upload_free} MB and for premium users a maximum of ${env.max_upload} MB.`
            if (chSize.oversize) return client.reply(m.chat, isOver, m)
            client.sendFile(m.chat, result.url, Func.filename('mp4'), `◦ *Quality* : HD`, m)
         } else {
            let result = json.data.find(v => v.quality == 'SD' && v.response == 200)
            if (!result) return client.reply(m.chat, global.status.fail, m)
            const size = await Func.getSize(result.url)
            const chSize = Func.sizeLimit(size, users.premium ? env.max_upload : env.max_upload_free)
            const isOver = users.premium ? `💀 File size (${size}) exceeds the maximum limit, download it by yourself via this link : ${await (await Scraper.shorten(result.url)).data.url}` : `⚠️ File size (${size}), you can only download files with a maximum size of ${env.max_upload_free} MB and for premium users a maximum of ${env.max_upload} MB.`
            if (chSize.oversize) return client.reply(m.chat, isOver, m)
            client.sendFile(m.chat, result.url, Func.filename('mp4'), `◦ *Quality* : SD`, m)
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