exports.run = {
   usage: ['profile'],
   async: async (m, {
      client,
      text,
      command,
      participants
   }) => {
      let number = isNaN(text) ? (text.startsWith('+') ? text.replace(/[()+\s-]/g, '') : (text).split`@` [1]) : text
      if (!text && !m.quoted) return client.reply(m.chat, Func.texted('bold', `Mention or Reply chat target.`), m)
      if (isNaN(number)) return client.reply(m.chat, Func.texted('bold', `Invalid number.`), m)
      if (number.length > 15) return client.reply(m.chat, Func.texted('bold', `Invalid format.`), m)
      let _own = [...new Set([global.owner, ...global.db.setting.owners])]
      try {
         if (text) {
            var user = number + '@s.whatsapp.net'
         } else if (m.quoted.sender) {
            var user = m.quoted.sender
         } else if (m.mentionedJid) {
            var user = number + '@s.whatsapp.net'
         }
      } catch (e) {} finally {
         let users = global.users[user]
         if (typeof users == 'undefined') return client.reply(m.chat, Func.texted('bold', `Can't find user data.`), m)
         let setting = global.setting
         let pic = await Func.fetchBuffer('./media/images/default.jpg')
         try {
            pic = await client.profilePictureUrl(user, 'image')
         } catch {} finally {
            let now = new Date() * 1
            let lastseen = (users.lastseen == 0) ? 'Never' : Func.toDate(now - users.lastseen)
            let usebot = (users.usebot == 0) ? 'Never' : Func.toDate(now - users.usebot)
            let caption = `❏  *U S E R - P R O F I L E*\n\n`
            caption += `	›  *Point* : ${Func.formatNumber(users.point)}\n`
            caption += `	›  *Limit* : ${(users.premium || _own.includes(user.split`@`[0])) ? '( ∞ ) Unlimited' : Func.formatNumber(users.limit)}\n`
            caption += `	›  *Warning* : ${users.warning} / 5\n`
            caption += `	›  *Hitstat* : ${Func.formatNumber(users.hit)}\n`
            caption += `	›  *Usebot* : ${usebot}\n`
            caption += `	›  *Lastseen* : ${lastseen}\n\n`
            caption += `❏  *U S E R - S T A T U S*\n\n`
            // caption += `	›  *Blocked* : ${Func.switcher(client.blocklist.includes(user.replace('s.whatsapp.net', 'c.us')), '√', '×')} \n`
            caption += `	›  *Banned* : ${Func.switcher(users.banned, '√', '×')}\n`
            caption += `	›  *Whitelist* : ${Func.switcher(users.whitelist, '√', '×')}\n`
            caption += `	›  *Owner* : ${Func.switcher(_own.includes(user.split`@`[0]), '√', '×')}\n`
            caption += `	›  *Use In Private* : ${Func.switcher(Object.keys(global.chats).includes(user), '√', '×')}\n`
            caption += `	›  *Premium* : ${Func.switcher(users.premium, '√', '×')}\n`
            caption += `	›  *Expired* : ${users.expired == 0 ? '-' : Func.timeReverse(users.expired - new Date * 1)}\n\n`
            caption += global.setting.footer
            client.sendImage(m.chat, pic, caption, m)
         }
      }
   },
   error: false,
   group: true,
   cache: true,
   location: __filename
}