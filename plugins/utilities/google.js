exports.run = {
   usage: ['google', 'goimg'],
   use: 'query',
   category: 'utilities',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      Func
   }) => {
      try {
         if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'cat'), m)
         client.sendReact(m.chat, '🕒', m.key)
         if (command == 'google') {
            const json = await Api.neoxr('/google', {
               q: text
            })
            if (!json.status) return client.reply(m.chat, global.status.fail, m)
            let teks = `乂  *G O O G L E - S E A R C H*\n\n`
            json.data.map((v, i) => {
               teks += '*' + (i + 1) + '. ' + v.title + '*\n'
               teks += '	◦  *Snippet* : ' + v.description + '\n'
               teks += '	◦  *Link* : ' + v.url + '\n\n'
            })
            client.sendMessageModify(m.chat, teks + global.footer, m, {
               ads: false,
               largeThumb: true,
               thumbnail: await Func.fetchBuffer('https://telegra.ph/file/d7b761ea856b5ba7b0713.jpg')
            })
         } else if (command == 'goimg') {
            const json = await Api.neoxr('/goimg', {
               q: text
            })
            if (!json.status) return client.reply(m.chat, global.status.fail, m)
            for (let i = 0; i < 5; i++) {
               var rand = Math.floor(json.data.length * Math.random())
               let caption = `乂  *G O O G L E - I M A G E*\n\n`
               caption += `	◦ *Title* : ${json.data[i].origin.title}\n`
               caption += `	◦ *Dimensions* : ${json.data[i].width} × ${json.data[i].height}\n\n`
               caption += global.footer
               client.sendFile(m.chat, json.data[rand].url, '', caption, m)
               await Func.delay(2500)
            }
         }
      } catch (e) {
         client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   restrict: true,
   limit: true,
   cache: true,
   location: __filename
}