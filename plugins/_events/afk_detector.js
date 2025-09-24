export const run = {
   async: async (m, {
      client,
      body,
      users,
      Utils
   }) => {
      try {
         let afk = [...new Set([...(m.mentionedJid || []), ...(m.quoted ? [m.quoted.sender] : [])])]
         for (let jid of afk) {
            let is_user = global.db.users.find(v =>
               v.jid == jid || v.lid === jid
            )
            if (!is_user) continue
            let afkTime = is_user.afk
            if (!afkTime || afkTime < 0) continue
            let reason = is_user.afkReason || ''
            if (!m.fromMe) {
               client.reply(m.chat, `*Away From Keyboard* : @${is_user.jid.split('@')[0]}\n• *Reason* : ${reason ? reason : '-'}\n• *During* : [ ${Utils.toTime(new Date - afkTime)} ]`, m).then(async () => {
                  client.reply(jid, `Someone from *${await (await client.groupMetadata(m.chat)).subject}*'s group, tagged or mention you.\n\n• *Sender* : @${m.sender.split('@')[0]}`, m).then(async () => {
                     await client.copyNForward(jid, m)
                  })
               })
            }
         }
      } catch (e) {
         return client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   group: true
}