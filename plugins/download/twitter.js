exports.run = {
   usage: ['twitter', 'tw'],
   async: async (m, {
      client,
      args,
      isPrefix,
      command
   }) => {
      try {
         if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'https://twitter.com/mosidik/status/1475812845249957889?s=20'), m)
         if (!args[0].match(/(twitter.com)/gi)) return client.reply(m.chat, global.status.invalid, m)
         client.sendReact(m.chat, '🕒', m.key)
         let json = await Api.twitter(args[0])
         if (!json.status) return client.reply(m.chat, Func.jsonFormat(json), m)
         let caption = `◦  *Author* : ${json.author}\n`
         caption += `◦  *Likes* : ${json.like}\n`
         caption += `◦  *Retweets* : ${json.retweet}\n`
         caption += `◦  *Comments* : ${json.reply}`
         for (let i = 0; i < json.data.length; i++) {
            if (/jpg|mp4/.test(v.type)) {
               client.sendFile(m.chat, v.url, '', caption, m)
               await Func.delay(1500)
            } else if (v.type == 'gif') {
               client.sendFile(m.chat, v.url, '', caption, m, {
                  gif: true
               })
            }
         }
      } catch (e) {
         console.log(e)
         return client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   limit: true,
   cache: true,
   location: __filename
}