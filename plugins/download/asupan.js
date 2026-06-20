export const run = {
   usage: ['asupan'],
   use: 'username (optional)',
   category: 'downloader',
   async: async (m, {
      client,
      args,
      Utils
   }) => {
      try {
         client.sendReact(m.chat, '🕒', m.key)
         // TikTok Username
         const json = await Api.neoxr('/asupan', {
            username: args[0] || Utils.random([
              'hosico_cat',
              'dibdiby',
              'bulansutena',
              'sesaaak',
              'ordinary307girl'
            ])
         })
         if (!json.status) return client.reply(m.chat, Utils.jsonFormat(json), m)
         let caption = `乂  *A S U P A N*\n\n`
         caption += `	◦  *Author* : ${json.data.author.nickname} (@${json.data.author.uniqueId})\n`
         caption += `	◦  *Views* : ${Utils.h2k(json.data.statistic.views)}\n`
         caption += `	◦  *Likes* : ${Utils.h2k(json.data.statistic.likes)}\n`
         caption += `	◦  *Shares* : ${Utils.h2k(json.data.statistic.shares)}\n`
         caption += `	◦  *Comments* : ${Utils.h2k(json.data.statistic.comments)}\n`
         caption += `	◦  *Sound* : ${json.data.music.title} - ${json.data.music.author}\n`
         caption += `	◦  *Caption* : ${json.data.caption || '-'}\n\n`
         caption += global.footer
         client.sendFile(m.chat, json.data.video.url, 'video.mp4', caption, m)
      } catch (e) {
         return client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true
}