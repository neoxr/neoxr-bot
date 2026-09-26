export const run = {
   usage: ['me'],
   category: 'user',
   async: async (m, {
      client,
      args,
      command,
      isPrefix,
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

         const targetId = command === 'me' ? String(m.sender.id) : (resolveTarget() || String(m.sender.id))
         let user = db.users.get ? db.users.get(targetId) : db.users.find(v => String(v.id) === targetId || String(v.username || '').replace(/^@/, '').toLowerCase() === targetId.toLowerCase())

         if (!user) {
            return client.reply(m.chat, 'User data not found in the database.', m)
         }

         const expDate = user.expired ? new Date(user.expired).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'
         const info = [
            `• ID: ${user.id}`,
            `• Name: ${user.name || '-'}`,
            `• Username: ${user.username ? `@${user.username}` : '-'}`,
            `• Limit: ${user.limit ?? 0}`,
            `• Premium: ${user.premium ? `Yes (${expDate})` : 'No'}`,
            `• Banned: ${user.banned ? 'Yes' : 'No'}`,
            `• Warnings: ${user.warning ?? 0}/5`,
            `• Hit: ${user.hit ?? 0}`
         ].join('\n')

         const avatar = await client.getProfilePhoto?.(user.id).catch(() => null)
         if (avatar) {
            return client.sendPhoto(m.chat, avatar, info, m)
         }
         return client.reply(m.chat, info, m)

      } catch (e) {
         return client.reply(m.chat, `Error: ${e.message}`, m)
      }
   },
   error: false
}