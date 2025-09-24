export const run = {
   usage: ['emojito'],
   use: 'emoji',
   category: 'converter',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      Utils
   }) => {
      try {
         let exif = global.db.setting
         if (!args || !args[0]) return client.reply(m.chat, Utils.example(isPrefix, command, '😳'), m)
         client.sendReact(m.chat, '🕒', m.key)
         const json = await Api.neoxr('/emojito', {
            q: args[0]
         })
         if (!json.status) return client.reply(m.chat, Utils.texted('bold', `🚩 ${json.msg}`), m)
         const buffer = await Utils.fetchAsBuffer(json.data.url)
         client.sendSticker(m.chat, buffer, m, {
            packname: exif.sk_pack,
            author: exif.sk_author,
            categories: [args[0]]
         })
      } catch (e) {
         return client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true
}