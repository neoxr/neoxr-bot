export const run = {
   usage: ['me'],
   category: 'user info',
   async: async (m, {
      client,
      blockList,
      Config,
      users,
      Utils
   }) => {
      const avatar = await client.profilePicture(m.sender)
      let blocked = blockList.includes(m.sender) ? true : false
      let now = new Date() * 1
      let lastseen = (users.lastseen == 0) ? 'Never' : Utils.toDate(now - users.lastseen)
      let usebot = (users.usebot == 0) ? 'Never' : Utils.toDate(now - users.usebot)
      let caption = `乂  *U S E R - P R O F I L E*\n\n`
      caption += `	◦  *Name* : ${m.pushName}\n`
      caption += `	◦  *Limit* : ${Utils.formatNumber(users.limit)}\n`
      caption += `	◦  *Hitstat* : ${Utils.formatNumber(users.hit)}\n`
      caption += `	◦  *Warning* : ${((m.isGroup) ? (typeof global.db.groups.find(v => v.jid == m.chat).member[m.sender] != 'undefined' ? global.db.groups.find(v => v.jid == m.chat).member[m.sender].warning : 0) + ' / 5' : users.warning + ' / 5')}\n\n`
      caption += `乂  *U S E R - S T A T U S*\n\n`
      caption += `	◦  *Blocked* : ${(blocked ? '√' : '×')}\n`
      caption += `	◦  *Banned* : ${(users.ban_temporary > 0 && (Date.now() - users.ban_temporary < Config.timeout))
         ? Utils.toTime((users.ban_temporary + Config.timeout) - Date.now()) + ' (' + (Config.timeout / 60000) + ' min)'
         : users.banned ? '√' : '×'}\n`
      caption += `	◦  *Use In Private* : ${(global.db.chats.map(v => v.jid).includes(m.sender) ? '√' : '×')}\n`
      caption += `	◦  *Premium* : ${(users.premium ? '√' : '×')}\n`
      caption += `	◦  *Expired* : ${users.expired == 0 ? '-' : Utils.timeReverse(users.expired - new Date() * 1)}\n\n`
      caption += global.footer
      client.sendMessageModify(m.chat, caption, m, {
         largeThumb: true,
         type: 'preview-link',
         /* choose: landscape (default), potrait, square */
         ratio: 'square',
         thumbnail: avatar
      })
   },
   error: false
}