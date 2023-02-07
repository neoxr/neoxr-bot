exports.run = {
   usage: ['igstalk'],
   use: 'username',
   category: 'utilities',
   async: async (m, {
      client,
      args,
      isPrefix,
      command
   }) => {
      try {
         if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'hosico_cat'), m)
         client.sendReact(m.chat, '🕒', m.key)
         let json = await Api.igstalk(args[0])
         if (!json.status) return client.reply(m.chat, Func.texted('bold', `🚩 Account not found.`), m)
         let caption = `乂  *I G - S T A L K*\n\n`
         caption += `	◦  *Name* : ${json.data.name}\n`
         caption += `	◦  *Username* : ${json.data.username}\n`
         caption += `	◦  *Posts* : ${json.data.post}\n`
         caption += `	◦  *Followers* : ${json.data.follower}\n`
         caption += `	◦  *Followings* : ${json.data.following}\n`
         caption += `	◦  *Bio* : ${json.data.about}\n`
         caption += `	◦  *Private* : ${Func.switcher(json.data.private, '√', '×')}\n\n`
         caption += global.footer
         client.sendMessageModify(m.chat, caption, m, {
            ads: false,
            largeThumb: true,
            thumbnail: await Func.fetchBuffer(json.data.photo)
         })
      } catch {
         return client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   cache: true,
   location: __filename
}