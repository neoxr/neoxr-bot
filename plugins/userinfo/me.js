export const run = {
   usage: ['me'],
   category: 'user info',
   async: async (m, {
      client,
      blockList,
      Config,
      users,
      setting,
      Utils
   }) => {
      try {
         const avatar = await client.profilePicture(m.sender).catch(() => null)
         const blocked = blockList.includes(m.rawNode?.attrs?.participant ?? m.rawNode?.attrs?.from)
         const groupData = m.isGroup ? global.db.groups.get(m.chat) : null
         const warningCount = m.isGroup ? (groupData?.member?.[m.sender]?.warning || 0) : (users.warning || 0)

         let caption = `乂  *U S E R - P R O F I L E*\n\n`
         caption += `   ◦  *Name* : ${m.pushName || '-'}\n`
         caption += `   ◦  *Limit* : ${Utils.formatNumber(users.limit)}\n`
         caption += `   ◦  *Hitstat* : ${Utils.formatNumber(users.hit)}\n`
         caption += `   ◦  *Warning* : ${warningCount} / 5\n\n`
         caption += `乂  *U S E R - S T A T U S*\n\n`
         caption += `   ◦  *Blocked* : ${blocked ? '√' : '×'}\n`
         caption += `   ◦  *Banned* : ${(users.ban_temporary > 0 && Date.now() - users.ban_temporary < Config.timeout)
            ? Utils.toTime((users.ban_temporary + Config.timeout) - Date.now()) + ` (${Config.timeout / 60000} min)`
            : users.banned ? '√' : '×'}\n`
         caption += `   ◦  *Use In Private* : ${global.db.chats.get(m.sender) ? '√' : '×'}\n`
         caption += `   ◦  *Premium* : ${users.premium ? '√' : '×'}\n`
         caption += `   ◦  *Expired* : ${users.expired === 0 ? '-' : Utils.timeReverse(users.expired - Date.now())}\n\n`
         caption += global.footer

         const icon = setting.icon ? (Utils.isUrl(setting.icon) ? setting.icon : Buffer.from(setting.icon, 'base64')) : null

         await client.sendMessageModify(m.chat, caption, m, {
            largeThumb: true,
            type: 'preview-link',
            ratio: 'square',
            thumbnail: avatar,
            icon
         })
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false
}
