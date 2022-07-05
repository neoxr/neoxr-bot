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
         let caption = '```◦ Limit   :``` ' + Func.formatNumber(user.limit) + '\n'
         caption += '```◦ Hitstat :``` ' + Func.formatNumber(user.hit) + '\n'
         caption += '```◦ Warning :``` ' + ((m.isGroup) ? (typeof global.db.groups[m.chat].member[m.sender] != 'undefined' ? global.db.groups[m.chat].member[m.sender].warning : 0) + ' / 5' : user.warning + ' / 5') + '\n'
         caption += '```◦ Banned  :``` ' + (user.banned ? '√' : '×') + '\n'
         caption += '```◦ Blocked :``` ' + (blocked ? '√' : '×') + '\n'
         caption += '```◦ In Chat :``` ' + (Object.keys(global.db.chats).includes(m.sender) ? '√' : '×') + '\n'
         caption += '```◦ Premium :``` ' + (user.premium ? '√' : '×')
         client.sendFile(m.chat, pic, '', caption, m)
      }
   },
   error: false,
   cache: true,
   location: __filename
}