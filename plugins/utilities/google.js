exports.run = {
   usage: ['google', 'goimg'],
   use: 'query',
   category: 'search',
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
            const json = await Func.fetchJson(`https://api.betabotz.eu.org/api/search/google?text1=${text}&apikey=beta-Ibrahim1209`);
            if (!json.status) return client.reply(m.chat, global.status.fail, m)
            let teks = `乂  *G O O G L E - S E A R C H*\n\n`
            json.result.map((v, i) => {
               teks += '*' + (i + 1) + '. ' + v.title + '*\n'
               teks += '	◦  *Snippet* : ' + v.snippet + '\n'
               teks += '	◦  *Link* : ' + v.link + '\n\n'
            })
            client.sendMessageModify(m.chat, teks + global.footer, m, {
               ads: false,
               largeThumb: true,
               thumbnail: await Func.fetchBuffer('https://telegra.ph/file/d7b761ea856b5ba7b0713.jpg')
            })
         } else if (command == 'goimg') {
            const json = await Func.fetchJson(`https://api.betabotz.eu.org/api/search/googleimage?text1=${text}&apikey=beta-Ibrahim1209`);
            if (!json.status) return client.reply(m.chat, global.status.fail, m)
            for (let i = 0; i < 5; i++) {
               var rand = Math.floor(json.result.length * Math.random())
               client.sendFile(m.chat, json.result[rand].url, '', '', m)
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
   verified: true,
   location: __filename
}