export const run = {
   usage: ['emojito'],
   use: 'emoji',
   category: 'converter',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      Utils,
      limitter,
      setting
   }) => {
      try {
         const [emoji] = args
         let exif = setting
         if (!emoji) return client.reply(m.chat, Utils.example(isPrefix, command, '😳'), m)
         client.sendReact(m.chat, '🕒', m.key)
         const json = await Api.neoxr('/emojito', {
            q: emoji
         })
         if (!json.status) return client.reply(m.chat, Utils.texted('bold', `❌ ${json.msg}`), m)
         const buffer = await Utils.fetchAsBuffer(json.data.url)
         client.sendSticker(m.chat, buffer, m, {
            packname: exif.sk_pack,
            author: exif.sk_author,
            categories: [emoji]
         })
         limitter()
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   limit: true
}
