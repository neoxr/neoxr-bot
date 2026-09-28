export const run = {
   async: async (m, {
      client,
      body,
      groupSet,
      setting,
      isAdmin,
      isBotAdmin,
      Utils
   }) => {
      try {
         if (groupSet?.filter && !isAdmin && isBotAdmin && !m.fromMe && body && setting?.toxic?.length) {
            const toxicRegex = new RegExp(`\\b(${setting.toxic.join('|')})\\b`, 'i')

            if (toxicRegex.test(body)) {
               groupSet.member[m.sender] = groupSet.member[m.sender] || { warning: 0 }
               groupSet.member[m.sender].warning = (groupSet.member[m.sender].warning || 0) + 1
               const warning = groupSet.member[m.sender].warning

               await client.sendMessage(m.chat, {
                  delete: {
                     remoteJid: m.chat,
                     fromMe: false,
                     id: m.key.id,
                     participant: m.sender
                  }
               }).catch(() => null)

               if (warning >= 5) {
                  await client.reply(m.chat, Utils.texted('bold', '❌ Warning : [ 5 / 5 ], goodbye ~~'), m)
                  await client.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
                  groupSet.member[m.sender].warning = 0
               } else {
                  client.reply(m.chat, `乂  *W A R N I N G*\n\nYou received a warning : [ ${warning} / 5 ]\nIf you reach 5 warnings, you will be automatically removed from the group.`, m)
               }
            }
         }
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   group: true
}
