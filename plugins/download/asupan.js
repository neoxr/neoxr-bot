exports.run = {
   usage: ['asupan'],
   use: 'username (optional)',
   category: 'downloader',
   async: async (m, {
      client,
      args,
      Func
   }) => {
      try {
         client.sendReact(m.chat, '🕒', m.key)
         // TikTok Username
         const json = await Api.neoxr('/asupan', {
            username: args[0] || Func.random([
               'itsbellefirst',
               'hosico_cat'
            ])
         })
         if (!json.status) return client.reply(m.chat, Func.jsonFormat(json), m)
         let caption = `乂  *A S U P A N*\n\n`
         caption += `	◦  *Author* : ${json.data.author.nickname} (@${json.data.author.username})\n`
         caption += `	◦  *Views* : ${Func.h2k(json.data.stats.play_count)}\n`
         caption += `	◦  *Likes* : ${Func.h2k(json.data.stats.digg_count)}\n`
         caption += `	◦  *Shares* : ${Func.h2k(json.data.stats.share_count)}\n`
         caption += `	◦  *Comments* : ${Func.h2k(json.data.stats.comment_count)}\n`
         caption += `	◦  *Sound* : ${json.data.music.title} - ${json.data.music.authorName}\n`
         caption += `	◦  *Caption* : ${json.data.caption || '-'}\n\n`
         caption += global.footer
         client.sendFile(m.chat, json.data.video.url, '', caption, m)
      } catch (e) {
         return client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true,
   cache: true,
   location: __filename
}