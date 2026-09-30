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
         if (!args || !args[0]) return client.reply(m.chat, Utils.example(isPrefix, command, '😳'), m)
         client.sendReact(m.chat, '🕒', m.key)
         const json = await Api.neoxr('/emojito', {
            q: args[0]
         })
         if (!json.status) return client.reply(m.chat, Utils.texted('bold', `❌ ${json.msg}`), m)
         const buffer = await Utils.fetchAsBuffer(json.data.url)
         client.sendSticker(m.chat, buffer, m, {
            packname: setting.sk_pack,
            author: setting.sk_author,
            categories: [args[0]]
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