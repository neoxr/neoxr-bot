exports.run = {
   usage: ['twitter'],
   hidden: ['tw', 'twdl', 'x'],
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
         if (args[0].match(/(x.com)/gi)) args[0] = args[0].replace(/(x.com)/gi, 'twitter.com')
         if (!args[0].match(/(twitter.com)/gi)) return client.reply(m.chat, global.status.invalid, m)
         client.sendReact(m.chat, '🕒', m.key)
         const json = await Api.neoxr('/twitter', {
            url: args[0]
         })
         let old = new Date()
         if (!json.status) return client.reply(m.chat, Func.jsonFormat(json), m)
         for (let i = 0; i < json.data.length; i++) {
            if (/jpg|mp4/.test(json.data[i].type)) {
               client.sendFile(m.chat, json.data[i].url, `file.${json.data[i].type}`, '', m)
               await Func.delay(1500)
            } else if (json.data[i].type == 'gif') {
               client.sendFile(m.chat, json.data[i].url, 'file.mp4', m, {
                  gif: true
               })
            }
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
