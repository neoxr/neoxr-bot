exports.run = {
   usage: ['yth', 'ythd', 'ytvhd'],
   async: async (m, {
      client,
      args,
      isPrefix,
      command
   }) => {
      try {
         if (!args || !args[0]) return client.reply(m.chat, `• ${Func.texted('bold', `Example`)} : ${isPrefix + command} https://youtu.be/zaRFmdtLhQ8`, m)
         client.reply(m.chat, global.status.getdata, m)
         var json = await scrap.ytvh(args[0])
         if (!json.status || !json.data.url) return client.reply(m.chat, Func.jsonFormat(json), m)
         let caption = `❏  *Y T - M P 4 (HD)*\n\n`
         caption += `	›  *Title* : ${json.title}\n`
         caption += `	›  *Size* : ${json.data.size}\n`
         caption += `	›  *Duration* : ${json.duration}\n`
         caption += `	›  *Quality* : ${json.data.quality}\n`
         caption += `	›  *Server* : ${json.server}\n\n`
         caption += global.setting.footer
         let chSize = Func.sizeLimit(json.data.size, global.max_upload)
         if (chSize.oversize) return client.reply(m.chat, `The file size (${json.data.size}) too large the size exceeds the limit, please download it by ur self via this link : ${await (await Func.shorten(json.data.url)).data.url}`, m)
         let isSize = (json.data.size).replace(/MB/g, '').trim()
         if (isSize > 99) return client.sendFile(m.chat, json.thumbnail, 'image.jpg', caption, m).then(async () => client.sendFile(m.chat, json.data.url, json.data.filename, '', m, {
            document: true
         }))
         client.sendFile(m.chat, json.data.url, 'video.mp4', caption, m)
      } catch (e) {
         console.log(e)
         return client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   limit: true,
   cache: true,
   location: __filename
}