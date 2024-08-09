exports.run = {
   usage: ['igstalk'],
   use: 'username',
   category: 'stalker',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      Func
   }) => {
      try {
         if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'erlanrahmat_14'), m)
         client.sendReact(m.chat, '🕒', m.key)
         const json = await Func.fetchJson(`https://api.betabotz.eu.org/api/stalk/ig?username=${args[0]}&apikey=beta-Ibrahim1209`)
         if (!json.status) return client.reply(m.chat, Func.texted('bold', `🚩 Account not found.`), m)
         let caption = `乂  *I G - S T A L K*\n\n`
         caption += `	◦  *Name* : ${json.result.fullName}\n`
         caption += `	◦  *Username* : ${json.result.username}\n`
         caption += `	◦  *Posts* : ${json.result.postsCount}\n`
         caption += `	◦  *Followers* : ${json.result.followers}\n`
         caption += `	◦  *Followings* : ${json.result.following}\n`
         caption += `	◦  *Bio* : ${json.result.bio}\n`
         caption += `	◦  *Private* : ${Func.switcher(json.result.private, '√', '×')}\n\n`
         caption += global.footer
         client.sendFile(m.chat, json.result.photoUrl, 'image.png', caption, m)
      } catch (e) {
         return client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true,
   cache: true,
   verified: true,
   location: __filename
}
