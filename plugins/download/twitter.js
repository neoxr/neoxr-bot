exports.run = {
   usage: ['twitter'],
   hidden: ['tw', 'twdl'],
   use: 'link',
   category: 'downloader',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      Func
   }) => {
      try {
         if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'https://twitter.com/mosidik/status/1475812845249957889?s=20'), m)
         if (!args[0].match(/(twitter.com)/gi)) return client.reply(m.chat, global.status.invalid, m)
         client.sendReact(m.chat, '🕒', m.key)
         const json = await Func.fetchJson(`https://api.betabotz.eu.org/api/download/twitter2?url=${args[0]}&apikey=beta-Ibrahim1209`);
         let old = new Date()
         if (!json.status) return client.reply(m.chat, Func.jsonFormat(json), m)
         
         const mediaURLs = json.result.mediaURLs;
         for (let url of mediaURLs) {
            if (url.match(/\.(jpg|jpeg|png)$/i)) {
               client.sendFile(m.chat, url, 'image.jpg', '', m)
            } else if (url.match(/\.(mp4|gif)$/i)) {
               client.sendFile(m.chat, url, 'video.mp4', '', m)
            }
            await Func.delay(1500)
         }
      } catch (e) {
         console.log(e)
         return client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true,
   cache: true,
   location: __filename
}
