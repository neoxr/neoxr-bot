exports.run = {
   usage: ['me'],
   async: async (m, {
      client,
      isPrefix,
      blockList
   }) => {
      let user = global.db.users[m.sender]
      let pic = await Func.fetchBuffer('./media/image/default.jpg')
      let _own = [...new Set([global.owner, ...global.db.setting.owners])]
      try {
         pic = await client.profilePictureUrl(m.sender, 'image')
      } catch {} finally {
         let blocked = blockList.includes(m.sender) ? true : false
         let now = new Date() * 1
         let lastseen = (user.lastseen == 0) ? 'Never' : Func.toDate(now - user.lastseen)
         let usebot = (user.usebot == 0) ? 'Never' : Func.toDate(now - user.usebot)
         let caption = `乂  *U S E R - P R O F I L E*\n\n`
         caption += `	◦  *Limit* : ${Func.formatNumber(user.limit)}\n`
         caption += `	◦  *Warning* : ${(m.isGroup) ? (typeof global.db.groups[m.chat].member[m.sender] != 'undefined' ? global.db.groups[m.chat].member[m.sender].warning : 0) + ' / 5' : user.warning + ' / 5'}\n`
         caption += `	◦  *Hitstat* : ${Func.formatNumber(user.hit)}\n`
         caption += `	◦  *Usebot* : ${usebot}\n`
         caption += `	◦  *Lastseen* : ${lastseen}\n\n`
         caption += `乂  *U S E R - S T A T U S*\n\n`
         caption += `	◦  *Banned* : ${user.banned ? '√' : '×'}\n`
         caption += `	◦  *Blocked* : ${blocked ? '√' : '×'}\n`    
         caption += `	◦  *Use In Private* : ${Object.keys(global.db.chats).includes(m.sender) ? 'Yes' : 'No'}\n`
         caption += `	◦  *Premium* : ${user.premium ? '√' : '×'}`
         client.sendFile(m.chat, pic, '', caption, m)
      }
   },
   error: false,
   cache: true,
   location: __filename
}