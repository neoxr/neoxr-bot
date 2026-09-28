export const run = {
   async: async (m, {
      client,
      Utils
   }) => {
      try {
         if (m.fromMe) return

         const targets = [...new Set([...(m.mentionedJid || []), ...(m.quoted ? [m.quoted.sender] : [])])]
         if (!targets.length) return

         for (const jid of targets) {
            const user = global.db.users.find(v => v.jid === jid || v.lid === jid)
            if (!user || !user.afk || user.afk < 0) continue

            const duration = Utils.toTime(Date.now() - user.afk)
            const reason = user.afkReason || '-'
            const text = `*Away From Keyboard* : @${user.jid.split('@')[0]}\n• *Reason* : ${reason}\n• *During* : [ ${duration} ]`

            client.reply(m.chat, text, m)
         }
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   group: true
}
