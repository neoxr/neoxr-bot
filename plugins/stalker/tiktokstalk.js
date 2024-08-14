exports.run = {
   usage: ['ttstalk'],
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
         if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'hosico_cat'), m)
         client.sendReact(m.chat, '🕒', m.key)
         let json = await Func.fetchJson(`https://api.cafirexos.com/api/tiktokstalk?username=${args[0]}`)
         if (!json.status) return client.reply(m.chat, Func.texted('bold', `🚩 Account not found.`), m)
         let caption = `乂  *T I K T O K  S T A L K*\n\n`
         caption += `	◦  *Name* : ${json.resultado.nickname}\n`
         caption += `	◦  *Username* : ${json.resultado.username}\n`
         caption += `	◦  *Bio* : ${json.resultado.description}\n`
         caption += `	◦  *videos* : ${json.resultado.totalVideos}\n`
         caption += `	◦  *likes* : ${json.resultado.totalLikes}\n`
         caption += `	◦  *Followers* : ${json.resultado.followers}\n`
         caption += `	◦  *Following* : ${json.resultado.following}\n`
         caption += `	◦  *Friends* : ${json.resultado.friends}\n`
         caption += `	◦  *Country* : ${json.resultado.region}\n\n`
         caption += global.footer
         client.sendFile(m.chat, json.resultado.pp_thumbnail, '', caption, m)
      } catch {
         return client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   cache: true,
   verified: true,
   location: __filename
}
