export const run = {
   usage: ['twitter'],
   hidden: ['tw', 'twdl'],
   use: 'link',
   category: 'downloader',
   async: async (m, {
      client,
      limitter,
      args,
      isPrefix,
      command,
      Utils
   }) => {
      const [argumen] = args
      try {
         if (!args || !argumen) return client.reply(m.chat, Utils.example(isPrefix, command, 'https://twitter.com/mosidik/status/1475812845249957889?s=20'), m)
         if (!argumen.match(/(x.com)/gi)) return client.reply(m.chat, global.status.invalid, m)
         client.sendReact(m.chat, '🕒', m.key)
         const json = await Api.neoxr('/twitter', {
            url: argumen
         })
         let old = new Date()
         if (!json.status) return client.reply(m.chat, Utils.jsonFormat(json), m)
         for (let v of json.data) {
            if (/jpg|mp4/.test(v.type)) {
               client.sendFile(m.chat, v.url, `file.${v.type}`, '', m)
            } else if (/gif/.test(v.type)) {
               client.sendFile(m.chat, v.url, 'file.mp4', '', m, {
                  gif: true
               })
            }
         }
         limitter()
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   limit: true

}
