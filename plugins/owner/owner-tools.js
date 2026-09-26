export const run = {
   usage: [
      'banuser', 'unbanuser',
      'addprem', 'delprem',
      'addlimit', 'setlimit',
      'warn', 'unwarn', 'resetwarn'
   ],
   category: 'owner',
   async: async (m, {
      client,
      args,
      command,
      isPrefix,
      Config,
      db
   }) => {
      try {
         if (!db?.users) {
            return client.reply(m.chat, 'User database is not accessible.', m)
         }

         const resolveTarget = () => {
            if (m.quoted?.sender?.id) return String(m.quoted.sender.id)
            if (m.mentionedJid && m.mentionedJid.length > 0) return String(m.mentionedJid[0])
            if (args[0]) {
               const clean = args[0].replace(/^@/, '').toLowerCase()
               if (/^\d+$/.test(clean)) return clean
               const u = db.users.get ? db.users.get(clean) : db.users.find(v => String(v.username || '').replace(/^@/, '').toLowerCase() === clean)
               if (u?.id) return String(u.id)
            }
            return null
         }

         const targetId = resolveTarget()
         if (!targetId) {
            return client.reply(m.chat, `Mention a user or reply to their message.\nExample: ${isPrefix + command} @username`, m)
         }

         if (Number(targetId) === Number(client.botInfo?.id)) {
            return client.reply(m.chat, 'Action cannot be performed on the bot itself.', m)
         }

         let user = db.users.get ? db.users.get(targetId) : db.users.find(v => String(v.id) === targetId || String(v.username || '').replace(/^@/, '').toLowerCase() === targetId.toLowerCase())

         if (!user) {
            return client.reply(m.chat, 'User data not found in the database.', m)
         }

         const targetName = user.name || (user.username ? `@${user.username}` : user.id)

         if (command === 'banuser') {
            if (user.banned) return client.reply(m.chat, `User ${targetName} is already banned.`, m)
            user.banned = true
            return client.reply(m.chat, `User ${targetName} has been banned from using the bot.`, m)
         }

         if (command === 'unbanuser') {
            if (!user.banned) return client.reply(m.chat, `User ${targetName} is not banned.`, m)
            user.banned = false
            return client.reply(m.chat, `User ${targetName} has been unbanned.`, m)
         }

         if (command === 'addprem') {
            const days = parseInt(args[1]) || (m.quoted ? parseInt(args[0]) : 30) || 30
            const now = Date.now()
            const duration = days * 24 * 60 * 60 * 1000

            user.premium = true
            user.limit += 1000
            user.expired = user.expired && user.expired > now ? user.expired + duration : now + duration

            const expiredDate = new Date(user.expired).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
            return client.reply(m.chat, `User ${targetName} is now premium for ${days} days until ${expiredDate}.`, m)
         }

         if (command === 'delprem') {
            if (!user.premium) return client.reply(m.chat, `User ${targetName} is not a premium user.`, m)
            user.premium = false
            user.limit = Config.limit
            user.expired = 0
            return client.reply(m.chat, `Premium status revoked for ${targetName}.`, m)
         }

         if (command === 'addlimit') {
            const amount = parseInt(args[1]) || (m.quoted ? parseInt(args[0]) : null)
            if (!amount || isNaN(amount)) {
               return client.reply(m.chat, `Specify the amount of limit to add.\nExample: ${isPrefix + command} @username 50`, m)
            }
            user.limit = (user.limit || 0) + amount
            return client.reply(m.chat, `Added ${amount} limit to ${targetName}. Current total: ${user.limit}`, m)
         }

         if (command === 'setlimit') {
            const amount = parseInt(args[1]) || (m.quoted ? parseInt(args[0]) : null)
            if (amount === null || isNaN(amount)) {
               return client.reply(m.chat, `Specify the exact limit.\nExample: ${isPrefix + command} @username 100`, m)
            }
            user.limit = amount
            return client.reply(m.chat, `Limit for ${targetName} has been set to ${amount}.`, m)
         }

         if (command === 'warn') {
            user.warning = (user.warning || 0) + 1
            if (user.warning >= 5) {
               user.banned = true
               return client.reply(m.chat, `User ${targetName} reached 5 warnings and has been banned.`, m)
            }
            return client.reply(m.chat, `User ${targetName} received a warning (${user.warning}/5).`, m)
         }

         if (command === 'unwarn') {
            if (!user.warning || user.warning <= 0) {
               return client.reply(m.chat, `User ${targetName} has no warnings.`, m)
            }
            user.warning = Math.max(0, user.warning - 1)
            return client.reply(m.chat, `Removed 1 warning from ${targetName}. Current warnings: ${user.warning}/5`, m)
         }

         if (command === 'resetwarn') {
            user.warning = 0
            return client.reply(m.chat, `Warnings for ${targetName} have been reset to 0.`, m)
         }

      } catch (e) {
         return client.reply(m.chat, `Error: ${e.message}`, m)
      }
   },
   error: false,
   owner: true
}