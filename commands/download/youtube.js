exports.run = {
   usage: ['yt', 'yta', 'ytv', 'ytmp3', 'ytmp4'],
   async: async (m, {
      client,
      args,
      isPrefix,
      command
   }) => {
      try {
         if (!args || !args[0]) return client.reply(m.chat, `• ${Func.texted('bold', `Example`)} : ${isPrefix + command} https://youtu.be/zaRFmdtLhQ8`, m)
         client.reply(m.chat, global.status.getdata, m)
         if (/yta|ytmp3/.test(command)) {
            var json = await scrap.youtube(args[0], 'audio')
            if (!json.data.url) {
               for (let i = 2; i < 5; ++i) {
                  var json = await scrap.youtube(args[0], 'audio')
                  await Func.delay(1500)
                  if (json.data.url) {
                     break
                  }
               }
            }
            if (!json.data.url) return client.reply(m.chat, global.status.fail, m)
            let caption = `❏  *Y T - M P 3*\n\n`
            caption += `	›  *Title* : ${json.title}\n`
            caption += `	›  *Size* : ${json.data.size}\n`
            caption += `	›  *Duration* : ${json.duration}\n`
            caption += `	›  *Bitrate* : ${json.data.quality}\n`
            caption += `	›  *Server* : ${json.server}\n\n`
            caption += global.setting.footer
            let chSize = Func.sizeLimit(json.data.size, global.max_upload)
            if (chSize.oversize) return client.reply(m.chat, `The file size (${json.data.size}) too large the size exceeds the limit, please download it by ur self via this link : ${await (await Func.shorten(json.data.url)).data.url}`, m)
            client.sendFile(m.chat, json.thumbnail, 'image.jpg', caption, m).then(() => {
               client.sendFile(m.chat, json.data.url, json.data.filename, '', m, {
                  document: true
               })
            })
         } else if (/ytv|ytmp4/.test(command)) {
            var json = await scrap.youtube(args[0], 'video')
            if (!json.data.url) {
               for (let i = 2; i < 5; ++i) {
                  var json = await scrap.youtube(args[0], 'video')
                  await Func.delay(1500)
                  if (json.data.url) {
                     break
                  }
               }
            }
            if (!json.data.url) return client.reply(m.chat, Func.jsonFormat(json), m)
            let caption = `❏  *Y T - M P 4*\n\n`
            caption += `	›  *Title* : ${json.title}\n`
            caption += `	›  *Size* : ${json.data.size}\n`
            caption += `	›  *Duration* : ${json.duration}\n`
            caption += `	›  *Quality* : ${json.data.quality}\n`
            caption += `	›  *Server* : ${json.server}\n\n`
            caption += global.setting.footer
            let chSize = Func.sizeLimit(json.data.size, global.max_upload)
            if (chSize.oversize) return client.reply(m.chat, `The file size (${json.data.size}) too large the size exceeds the limit, please download it by ur self via this link : ${await (await Func.shorten(json.data.url)).data.url}`, m)
            let isSize = (json.data.size).replace(/MB/g, '').trim()
            if (isSize > 99) return client.sendFile(m.chat, json.thumbnail, 'image.jpg', caption, m).then(async () => await client.sendFile(m.chat, json.data.url, json.data.filename, '', m, {
               document: true
            }))
            client.sendFile(m.chat, json.data.url, 'video.mp4', caption, m)
         } else if (command == 'yt') {
            let json = await scrap.youtube(args[0], 'combine')
            if (!json.status) return client.reply(m.chat, Func.jsonFormat(json), m)
            let mp3 = json.data.find(v => v.extension == 'mp3')
            let mp4 = json.data.find(v => v.extension == 'mp4')
            let caption = `❏  *Y O U T U B E*\n\n`
            caption += `	›  *Title* : ${json.title}\n`
            caption += `	›  *Duration* : ${json.duration}\n`
            caption += `	›  *Channel* : ${json.channel}\n`
            caption += `	›  *Views* : ${json.views}\n`
            caption += `	›  *Publish* : ${json.publish}\n`
            caption += `	›  *Server* : ${json.server}\n`
            await client.sendTemplateButton(m.chat, json.thumbnail, caption, global.setting.footer, [{
                  quickReplyButton: {
                     displayText: `Audio (${mp3.size})`,
                     id: `${isPrefix}yta ${args[0]}`
                  }
               },
               {
                  quickReplyButton: {
                     displayText: `Video (${mp4.size})`,
                     id: `${isPrefix}ytv ${args[0]}`
                  }
               }
            ], {
               location: true
            })
         }
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