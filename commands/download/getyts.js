exports.run = {
   usage: ['mp3', 'mp4'],
   async: async (m, {
      client,
      args,
      isPrefix,
      command
   }) => {
      try {
         if (!m.quoted) return client.reply(m.chat, Func.texted('bold', `Reply chat from me.`), m)
         if (!m.quoted && (!/mp3/.test(m.quoted.text)) && (!/mp4/.test(m.quoted.text))) return client.reply(m.chat, Func.texted('bold', `Reply chat from me.`), m)
         if (m.quoted.sender != client.user.id.split(':')[0] + '@s.whatsapp.net') return
         if (!args || !args[0]) return client.reply(m.chat, Func.texted('bold', `Give the number from youtube search results.`), m)
         if (isNaN(args[0])) return client.reply(m.chat, Func.texted('bold', `Must be a number.`), m)
         let no = (m.quoted.text).split('Token* :').length - 1
         if (args[0] > no) return client.reply(m.chat, Func.texted('bold', `Sorry, youtube search results are only ${(no)}.`), m)
         client.reply(m.chat, global.status.getdata, m)
         var _id = ((m.quoted.text).split('Token* :')[args[0].trim()].split('›')[0]).trim()
         if (command == 'mp3') {
            var json = await scrap.youtube('https://youtu.be/' + _id, 'audio')
            if (!json.data.url) {
               for (let i = 2; i < 5; ++i) {
                  var json = await scrap.youtube('https://youtu.be/' + _id, 'audio')
                  await Func.delay(1500)
                  if (json.data.url) {
                     break
                  }
               }
            }
            if (!json.data.url) return client.reply(m.chat, Func.jsonFormat(json), m)
            let caption = `❏  *Y T - M P 3*\n\n`
            caption += `	›  *Title* : ${json.title}\n`
            caption += `	›  *Size* : ${json.data.size}\n`
            caption += `	›  *Duration* : ${json.duration}\n`
            caption += `	›  *Bitrate* : ${json.data.quality}\n`
            caption += `	›  *Server* : ${json.server}\n\n`
            caption += global.setting.footer
            let chSize = Func.sizeLimit(json.data.size, global.max_upload)
            if (chSize.oversize) return client.reply(m.chat, `The file size (${json.data.size}) too large the size exceeds the limit, please download it by ur self via this link : ${await (await Func.shorten(json.data.url)).data.url}`, m)
            client.sendFile(m.chat, json.thumbnail, '', caption, m).then(() => {
               client.sendFile(m.chat, json.data.url, json.data.filename, '', m, {
                  document: true
               })
            })
         } else if (command == 'mp4') {
            var json = await scrap.youtube('https://youtu.be/' + _id, 'video')
            if (!json.data.url) {
               for (let i = 2; i < 5; ++i) {
                  var json = await scrap.youtube('https://youtu.be/' + _id, 'video')
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
            if (isSize > 99) return client.sendFile(m.chat, json.thumbnail, '', caption, m).then(() => client.sendFile(m.chat, json.data.url, json.data.filename, '', m, {
               document: true
            }))
            client.sendFile(m.chat, json.data.url, 'video.mp4', caption, m)
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