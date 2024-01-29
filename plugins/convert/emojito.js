const fetch = require('node-fetch')
exports.run = {
   usage: ['emojito'],
   use: 'emoji',
   category: 'converter',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      Func
   }) => {
      try {
         let exif = global.db.setting
         if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, '😳'), m)
         client.sendReact(m.chat, '🕒', m.key)
         const json = await Api.neoxr('/emojito', {
            q: args[0]
         })
         if (!json.status) return client.reply(m.chat, Func.texted('bold', `🚩 ${json.msg}`), m)
         const buffer = await Func.fetchBuffer(json.data.url)
         client.sendSticker(m.chat, buffer, m, {
            packname: exif.sk_pack,
            author: exif.sk_author,
            categories: [args[0]]
         })
      } catch (e) {
         return client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true,
   cache: true,
   location: __filename
}