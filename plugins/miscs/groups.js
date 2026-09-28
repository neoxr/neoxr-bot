import { format } from 'date-fns'
import { models } from '../../lib/models.js'

export const run = {
   usage: ['groups'],
   category: 'miscs',
   async: async (m, {
      client,
      isPrefix,
      Utils
   }) => {
      try {
         global.db.groups = global.db.groups || []
         const group = global.db.groups

         const participatingGroups = await client.group.queryAllGroups()
         if (!participatingGroups?.length) return client.reply(m.chat, '❌ Bot has not joined any groups yet.', m)

         const now = Date.now()
         const currentTime = format(now, 'dd/MM/yy HH:mm:ss')

         const groupDetails = participatingGroups.filter(v => !v.isClosedCommunity).map((_group, i) => {
            const { jid, subject, participants } = _group
            let entry = group.find(g => g.jid === jid)

            if (entry) {
               const expiryStatus = entry.stay ? 'FOREVER' : (entry.expired === 0 ? 'NOT SET' : Utils.timeReverse(entry.expired - now))
               const memberCount = participants?.length || 0
               const muteStatus = entry.mute ? 'OFF' : 'ON'

               return (
                  `›  *${i + 1}.* ${subject}\n` +
                  `   *💳* : ${jid.split('@')[0]}\n` +
                  `   ${expiryStatus} | ${memberCount} | ${muteStatus} | ${currentTime}`
               )
            }

            const newEntry = {
               jid,
               ...models.groups
            }
            group.push(newEntry)

            return (
               `›  *${i + 1}.* ${subject}\n` +
               `   *💳* : ${jid.split('@')[0]}\n` +
               `   *✅ NEW - Added to database, details will show on next run.*`
            )
         }).join('\n\n')

         let caption = `乂  *G R O U P - L I S T*\n\n`
         caption += `*“Bot has joined ${participatingGroups.length} groups, send _${isPrefix}gc_ or _${isPrefix}gcopt_ to show all setup options.”*\n\n`
         caption += groupDetails
         caption += `\n\n${global.footer}`

         client.reply(m.chat, caption, m)
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false
}
