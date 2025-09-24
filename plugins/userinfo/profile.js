export const run = {
   usage: ['profile'],
   use: 'mention or reply',
   category: 'user info',
   async: async (m, {
      client,
      text,
      blockList,
      Config,
      Utils
   }) => {
      let number = isNaN(text) ? (text.startsWith('+') ? text.replace(/[()+\s-]/g, '') : (text).split`@`[1]) : text
      if (!text && !m.quoted) return client.reply(m.chat, Utils.texted('bold', `🚩 Mention or Reply chat target.`), m)
      if (isNaN(number)) return client.reply(m.chat, Utils.texted('bold', `🚩 Invalid number.`), m)
      if (number.length > 15) return client.reply(m.chat, Utils.texted('bold', `🚩 Invalid format.`), m)
      try {
         if (text) {
            var user = number + '@s.whatsapp.net'
         } else if (m.quoted.sender) {
            var user = m.quoted.sender
         } else if (m.mentionedJid) {
            var user = number + '@s.whatsapp.net'
         }
      } catch (e) { } finally {
         let target = global.db.users.find(v => v.jid == user)
         if (typeof target == 'undefined') return client.reply(m.chat, Utils.texted('bold', `🚩 Can't find user data.`), m)
         var pic = await client.profilePictureUrl(user, 'image')
         let blocked = blockList.includes(user) ? true : false
         let caption = `乂  *U S E R - P R O F I L E*\n\n`
         caption += `	◦  *Name* : ${target.name}\n`
         caption += `	◦  *Limit* : ${Utils.formatNumber(target.limit)}\n`
         caption += `	◦  *Hitstat* : ${Utils.formatNumber(target.hit)}\n`
         caption += `	◦  *Warning* : ${((m.isGroup) ? (typeof global.db.groups.find(v => v.jid == m.chat).member[user] != 'undefined' ? global.db.groups.find(v => v.jid == m.chat).member[user].warning : 0) + ' / 5' : target.warning + ' / 5')}\n\n`
         caption += `乂  *U S E R - S T A T U S*\n\n`
         caption += `	◦  *Blocked* : ${(blocked ? '√' : '×')}\n`
         caption += `	◦  *Banned* : ${(new Date - target.ban_temporary < Config.timer) ? Utils.toTime(new Date(target.ban_temporary + Config.timeout) - new Date()) + ' (' + ((Config.timeout / 1000) / 60) + ' min)' : target.banned ? '√' : '×'}\n`
         caption += `	◦  *Use In Private* : ${(global.db.chats.map(v => v.jid).includes(user) ? '√' : '×')}\n`
         caption += `	◦  *Premium* : ${(target.premium ? '√' : '×')}\n`
         caption += `	◦  *Expired* : ${target.expired == 0 ? '-' : Utils.timeReverse(target.expired - new Date() * 1)}\n\n`
         caption += global.footer
         client.sendMessageModify(m.chat, caption, m, {
            largeThumb: true,
            thumbnail: pic ? await Utils.fetchAsBuffer(pic) : await Utils.fetchAsBuffer('./media/image/default.jpg')
         })
      }
   },
   error: false
}