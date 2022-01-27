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
         client.reply(m.chat, global.status.getdata, m)
         let json = await Api.twitter(args[0])
         if (!json.status) return client.reply(m.chat, global.status.fail, m)
         let caption = `❏  *T W I T T E R*\n\n`
         caption += `	›  *Author* : ${json.author}\n`
         caption += `	›  *Likes* : ${json.like}\n`
         caption += `	›  *Retweets* : ${json.retweet}\n`
         caption += `	›  *Comments* : ${json.reply}\n\n`
         caption += global.setting.footer
         for (let i = 0; i < json.data.length; i++) {
            if (json.data[i].type == 'mp4') {
               client.sendFile(m.chat, json.data[i].url, 'video.mp4', caption, m)
            } else if (json.data[i].type == 'jpg') {
               client.sendFile(m.chat, json.data[i].url, 'image.jpg', caption, m)
               await Func.delay(1500)
            } else if (json.data[i].type == 'gif') {
               client.sendFile(m.chat, json.data[i].url, 'video.mp4', caption, m, {
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