const fetch = require('node-fetch')
exports.run = {
   usage: ['attp', 'attp2'],
   use: 'text',
   category: 'converter',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      Func,
      text
   }) => {
      try {
         if (command == 'attp') {
            let exif = global.db.setting
            if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'Ibrahim'), m)
            client.sendReact(m.chat, '🕒', m.key)
            const encodedText = encodeURIComponent(text)
            const json = await Func.fetchBuffer(`https://api.lolhuman.xyz/api/attp?apikey=GataDiosV2&text=${encodedText}`)
            client.sendSticker(m.chat, json, m, {
               packname: exif.sk_pack,
               author: exif.sk_author
            })
         } else if (command == 'attp2') {
            let exif = global.db.setting
            if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'Ibrahim'), m)
            client.sendReact(m.chat, '🕒', m.key)
            const encodedText = encodeURIComponent(text)
            const json = await Func.fetchBuffer(`https://api.lolhuman.xyz/api/attp2?apikey=GataDiosV2&text=${encodedText}`)
            client.sendSticker(m.chat, json, m, {
               packname: exif.sk_pack,
               author: exif.sk_author
            })
         }

      } catch (e) {
         return client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true,
   cache: true,
   verified: true,
   location: __filename
}