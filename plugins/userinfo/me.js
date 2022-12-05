exports.run = {
   usage: ['me'],
   category: 'user info',
   async: async (m, {
      client,
      isPrefix,
      blockList
   }) => {
      let user = global.db.users.find(v => v.jid == m.sender)
      let pic = await Func.fetchBuffer('./media/image/default.jpg')
      let _own = [...new Set([global.owner, ...global.db.setting.owners])]
      try {
         pic = await Func.fetchBuffer(await client.profilePictureUrl(m.sender, 'image'))
      } catch {} finally {
         let blocked = blockList.includes(m.sender) ? true : false
         let now = new Date() * 1
         let lastseen = (user.lastseen == 0) ? 'Never' : Func.toDate(now - user.lastseen)
         let usebot = (user.usebot == 0) ? 'Never' : Func.toDate(now - user.usebot)
         let caption = `乂  *U S E R - P R O F I L E*\n\n`
         caption += `	◦ *Name* : ${m.pushName}\n`
         caption += `	◦ *Limit* : ${Func.formatNumber(user.limit)}\n`
         caption += `	◦ *Hitstat* : ${Func.formatNumber(user.hit)}\n`
         caption += `	◦ *Warning* : ${((m.isGroup) ? (typeof global.db.groups.find(v => v.jid == m.chat).member[m.sender] != 'undefined' ? global.db.groups.find(v => v.jid == m.chat).member[m.sender].warning : 0) + ' / 5' : user.warning + ' / 5')}\n\n`
         caption += `乂  *U S E R - S T A T U S*\n\n`
         caption += `	◦ *Blocked* : ${(blocked ? '√' : '×')}\n`
         caption += `	◦ *Banned* : ${(new Date - user.banTemp < global.timer) ? Func.toTime(new Date(user.banTemp + global.timer) - new Date()) + ' (' + ((global.timer / 1000) / 60) + ' min)' : user.banned ? '√' : '×'}\n`
         caption += `	◦ *Use In Private* : ${(global.db.chats.map(v => v.jid).includes(m.sender) ? '√' : '×')}\n`
         caption += `	◦ *Premium* : ${(user.premium ? '√' : '×')}\n`
         caption += `	◦ *Expired* : ${user.expired == 0 ? '-' : Func.timeReverse(user.expired - new Date() * 1)}\n\n`
         caption += global.footer
         client.sendMessageModify(m.chat, caption, m, {
             largeThumb: true,
             thumbnail: pic
         })
      }
   },
   error: false,
   cache: true,
   location: __filename
}