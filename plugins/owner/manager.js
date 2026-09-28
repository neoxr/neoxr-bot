export const run = {
   usage: ['+owner', '-owner', '-prem', 'block', 'unblock', 'ban', 'unban'],
   use: 'mention or reply',
   category: 'owner',
   async: async (m, {
      client,
      text,
      command,
      Config,
      setting,
      Utils
   }) => {
      try {
         let user = m.mentionedJid?.[0] || m.quoted?.sender
         const validate = Utils.validatePhone ? Utils.validatePhone(text?.trim()) : { valid: false }

         if (text && validate.valid) {
            user = validate.jid_format
         } else if (text && !user) {
            const cleanNum = text.replace(/[^0-9]/g, '')
            if (cleanNum.length > 0 && cleanNum.length <= 16) {
               user = cleanNum + '@s.whatsapp.net'
            }
         }

         if (!user) return client.reply(m.chat, Utils.texted('bold', '❌ Mention, reply, or enter a valid number target.'), m)

         const number = user.replace(/@.+/, '')
         const botJid = client.decodeJid(client.getCredentials()?.meJid)

         if (command === '+owner') {
            setting.owners = setting.owners || []
            if (setting.owners.includes(number)) return client.reply(m.chat, Utils.texted('bold', '❌ Target is already an owner.'), m)
            setting.owners.push(number)
            return client.reply(m.chat, Utils.texted('bold', `✅ Successfully added @${number} as owner.`), m)
         }

         if (command === '-owner') {
            setting.owners = setting.owners || []
            if (!setting.owners.includes(number)) return client.reply(m.chat, Utils.texted('bold', '❌ Target is not an owner.'), m)
            setting.owners = setting.owners.filter(v => v !== number)
            return client.reply(m.chat, Utils.texted('bold', `✅ Successfully removed @${number} from owner list.`), m)
         }

         if (command === '-prem') {
            const data = global.db.users.get(user)
            if (!data) return client.reply(m.chat, Utils.texted('bold', "❌ Can't find user data."), m)
            if (!data.premium) return client.reply(m.chat, Utils.texted('bold', '❌ Target is not a premium user.'), m)
            data.limit = Config.limit
            data.premium = false
            data.expired = 0
            return client.reply(m.chat, Utils.texted('bold', `✅ @${number}'s premium status has been successfully removed.`), m)
         }

         if (command === 'block') {
            if (user === botJid) return client.reply(m.chat, Utils.texted('bold', '❌ Cannot block the bot itself.'), m)
            await client.updateBlockStatus(user, 'block')
            return client.reply(m.chat, Utils.texted('bold', `✅ Successfully blocked @${number}.`), m)
         }

         if (command === 'unblock') {
            await client.updateBlockStatus(user, 'unblock')
            return client.reply(m.chat, Utils.texted('bold', `✅ Successfully unblocked @${number}.`), m)
         }

         if (command === 'ban') {
            const ownerList = [botJid.split('@')[0], Config.owner, ...(setting.owners || [])].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net')
            if (ownerList.includes(user)) return client.reply(m.chat, Utils.texted('bold', "❌ Cannot ban an owner's number."), m)
            if (user === botJid) return client.reply(m.chat, Utils.texted('bold', '❌ Cannot ban the bot itself.'), m)

            const target = global.db.users.get(user)
            if (!target) return client.reply(m.chat, Utils.texted('bold', '❌ User data not found.'), m)
            if (target.banned) return client.reply(m.chat, Utils.texted('bold', '❌ Target is already banned.'), m)

            target.banned = true
            const totalBanned = global.db.users.filter(v => v.banned).length
            return client.reply(m.chat, `乂  *B A N N E D*\n\n*“Successfully added @${number} to banned list.”*\n\n*Total : ${totalBanned}*`, m)
         }

         if (command === 'unban') {
            const target = global.db.users.get(user)
            if (!target) return client.reply(m.chat, Utils.texted('bold', '❌ User data not found.'), m)
            if (!target.banned) return client.reply(m.chat, Utils.texted('bold', '❌ Target is not banned.'), m)

            target.banned = false
            const totalBanned = global.db.users.filter(v => v.banned).length
            return client.reply(m.chat, `乂  *U N B A N N E D*\n\n*“Successfully removed @${number} from banned list.”*\n\n*Total : ${totalBanned}*`, m)
         }
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   owner: true
}
