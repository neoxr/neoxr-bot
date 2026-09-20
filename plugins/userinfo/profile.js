export const run = {
   usage: ['profile'],
   use: 'mention or reply',
   category: 'user info',
   async: async (m, {
      client,
      text,
      blockList,
      setting,
      Config,
      Utils
   }) => {
      try {
         let user = m.mentionedJid?.[0] || m.quoted?.sender
         const validate = Utils.validatePhone(text?.trim())

         if (text && validate.valid) {
            user = validate.jid_format
         } else if (text && !user) {
            const cleanNum = text.replace(/[^0-9]/g, '')
            if (cleanNum.length > 0 && cleanNum.length <= 16) {
               user = cleanNum + '@s.whatsapp.net'
            }
         }

         if (!user) return client.reply(m.chat, Utils.texted('bold', '🚩 Mention, reply, or enter a valid number target.'), m)

         const target = global.db.users.get(user)
         if (!target) return client.reply(m.chat, Utils.texted('bold', "🚩 Can't find user data."), m)

         const avatar = await client.profilePicture(user).catch(() => null)
         const blocked = blockList.includes(user)
         const groupData = m.isGroup ? global.db.groups.get(m.chat) : null
         const warningCount = m.isGroup ? (groupData?.member?.[user]?.warning || 0) : (target.warning || 0)

         let caption = `乂  *U S E R - P R O F I L E*\n\n`
         caption += `   ◦  *Name* : ${target.name || '-'}\n`
         caption += `   ◦  *Limit* : ${Utils.formatNumber(target.limit || 0)}\n`
         caption += `   ◦  *Hitstat* : ${Utils.formatNumber(target.hit || 0)}\n`
         caption += `   ◦  *Warning* : ${warningCount} / 5\n\n`
         caption += `乂  *U S E R - S T A T U S*\n\n`
         caption += `   ◦  *Blocked* : ${blocked ? '√' : '×'}\n`
         caption += `   ◦  *Banned* : ${(target.ban_temporary > 0 && Date.now() - target.ban_temporary < Config.timeout) ? Utils.toTime((target.ban_temporary + Config.timeout) - Date.now()) + ` (${Config.timeout / 60000} min)` : target.banned ? '√' : '×'}\n`
         caption += `   ◦  *Use In Private* : ${global.db.chats.some(v => v.jid === user) ? '√' : '×'}\n`
         caption += `   ◦  *Premium* : ${target.premium ? '√' : '×'}\n`
         caption += `   ◦  *Expired* : ${target.expired === 0 ? '-' : Utils.timeReverse(target.expired - Date.now())}\n\n`
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
         return client.reply(m.chat, global.status.error, m)
      }
   },
   error: false
}