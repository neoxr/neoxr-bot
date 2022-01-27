let yts = require('yt-search')
exports.run = {
   usage: ['yts', 'ytfind', 'ytsearch'],
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      isOwner
   }) => {
      try {
         if (!text) return client.reply(m.chat, `• ${Func.texted('bold', `Example`)} : ${isPrefix + command} lathi`, m)
         if (!isOwner && text.match(/(bugil|bokep|hentai|sex|desah)/gi)) {
            client.updateBlockStatus(m.sender, 'block')
            let user = global.users
            user[m.sender].banned = true
            let banned = 0
            for (let jid in user) {
               if (user[jid].banned) banned++
            }
            return client.reply(m.chat, `“${text}”\n\nKeyword is not allowed use this bot for positive things and now your number has been *banned* and *blocked.*\n\nIf you want to *unban* and *unblock* pay me with your money with the price 50K, send me *${isPrefix}owner*`, m)
         }
         client.reply(m.chat, global.status.getdata, m)
         let yt = await yts(text)
         let videos = yt.videos.slice(0, 10)
         let no = 1
         let caption = `❏  *Y T - S E A R C H*\n\n`
         caption += `*“To download audio reply this chat with command _${isPrefix}mp3 number_ and for video use _${isPrefix}mp4 number_, Example : ${isPrefix}mp3 1”*\n${readMore}\n`
         videos.forEach(function(v) {
            caption += '*' + (no++) + '. ' + v.title + '*\n'
            caption += '	›  *Token* : ' + v.videoId + '\n'
            caption += '	›  *Duration* : ' + v.seconds + ' (' + v.timestamp + ')\n'
            caption += '	›  *Views* : ' + Func.formatNumber(v.views) + '\n'
            caption += '	›  *Publish* : ' + v.ago + '\n'
            caption += '	›  *Channel* : ' + v.author.name + '\n\n'
         })
         client.fakeStory(m.chat, caption + global.setting.footer, global.setting.header)
      } catch {
         return client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   cache: true,
   location: __filename
}

let readMore = String.fromCharCode(8206).repeat(4001)