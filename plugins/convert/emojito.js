export const run = {
   usage: ['emojito'],
   use: 'emoji',
   category: 'converter',
   async: async (m, {
      client,
      limitter,
      setting,
      args,
      isPrefix,
      command,
      Utils
   }) => {
      const [argumen] = args
      try {
         let exif = setting
         if (!args || !argumen) return client.reply(m.chat, Utils.example(isPrefix, command, '😳'), m)
         client.sendReact(m.chat, '🕒', m.key)
         const json = await Api.neoxr('/emojito', {
            q: argumen
         })
         if (!json.status) return client.reply(m.chat, Utils.texted('bold', `❌ ${json.msg}`), m)
         const buffer = await Utils.fetchAsBuffer(json.data.url)
         client.sendSticker(m.chat, buffer, m, {
            packname: exif.sk_pack,
            author: exif.sk_author,
            categories: [argumen]
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