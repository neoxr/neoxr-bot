exports.run = {
   usage: ['me'],
   async: async (m, {
      client,
      isPrefix
   }) => {
      let user = global.users[m.sender]
      let pic = await Func.fetchBuffer('./media/images/default.jpg')
      let _own = [...new Set([global.owner, ...global.db.setting.owners])]
      try {
         pic = await client.profilePictureUrl(m.sender, 'image')
      } catch {} finally {
         let name = m.pushName || 'No Name'
         let now = new Date() * 1
         let lastseen = (user.lastseen == 0) ? 'Never' : Func.toDate(now - user.lastseen)
         let usebot = (user.usebot == 0) ? 'Never' : Func.toDate(now - user.usebot)
         let caption = `❏  *U S E R - P R O F I L E*\n\n`
         caption += `	›  *Name* : ${name}\n`
         caption += `	›  *Point* : ${Func.formatNumber(user.point)}\n`
         caption += `	›  *Limit* : ${(user.premium || _own.includes(m.sender.split`@`[0])) ? '( ∞ ) Unlimited' : Func.formatNumber(user.limit)}\n`
         caption += `	›  *Warning* : ${user.warning} / 5\n`
         caption += `	›  *Hitstat* : ${Func.formatNumber(user.hit)}\n`
         caption += `	›  *Usebot* : ${usebot}\n`
         caption += `	›  *Lastseen* : ${lastseen}\n\n`
         caption += `❏  *U S E R - S T A T U S*\n\n`
         // caption += `	›  *Blocked* : ${Func.switcher(client.blocklist.includes(m.sender.replace('s.whatsapp.net', 'c.us')), '√', '×')} \n`
         caption += `	›  *Banned* : ${Func.switcher(user.banned, '√', '×')}\n`
         caption += `	›  *Whitelist* : ${Func.switcher(user.whitelist, '√', '×')}\n`
         caption += `	›  *Owner* : ${Func.switcher(_own.includes(m.sender.split`@`[0]), '√', '×')}\n`
         caption += `	›  *Use In Private* : ${Func.switcher(Object.keys(global.chats).includes(m.sender), '√', '×')}\n`
         caption += `	›  *Premium* : ${Func.switcher(user.premium, '√', '×')}\n`
         caption += `	›  *Expired* : ${user.expired == 0 ? '-' : Func.timeReverse(user.expired - new Date * 1)}\n\n`
         caption += global.setting.footer
         client.sendFile(m.chat, pic, 'image.png', caption, m)
      }
   },
   error: false,
   cache: true,
   location: __filename
}