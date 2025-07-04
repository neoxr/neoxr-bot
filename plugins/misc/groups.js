const moment = require('moment-timezone')
const { models } = require('../../lib/system/models')

exports.run = {
   usage: ['groups'],
   category: 'miscs',
   async: async (m, {
      client,
      isPrefix,
      Func
   }) => {
      let group = global.db.groups
      if (!group) group = []

      const participatingGroups = Object.values(await client.groupFetchAllParticipating())

      const groupDetails = participatingGroups.map((_group, i) => {
         const { id, subject, participants } = _group
         let entry = group.find(g => g.jid === id)

         if (entry) {
            const expiryStatus = entry.stay ? 'FOREVER' : (entry.expired == 0 ? 'NOT SET' : '' + Func.timeReverse(entry.expired - new Date() * 1))
            const memberCount = participants.length
            const muteStatus = entry.mute ? 'OFF' : 'ON'
            const lastActivity = moment(entry.activity).format('DD/MM/YY HH:mm:ss')

            return (
               `›  *${i + 1}.* ${subject}\n` +
               `   *💳* : ${id.split('@')[0]}\n` +
               `   ${expiryStatus} | ${memberCount} | ${muteStatus} | ${lastActivity}`
            )
         } else {
            const newEntry = {
               jid: id,
               ...models.groups
            }
            group.push(newEntry)

            return (
               `›  *${i + 1}.* ${subject}\n` +
               `   *💳* : ${id.split('@')[0]}\n` +
               `   *✅ NEW - Added to database, details will show on next run.*`
            )
         }
      }).join('\n\n')

      let caption = `乂  *G R O U P - L I S T*\n\n`
      caption += `*“Bot has joined ${participatingGroups.length} groups, send _${isPrefix}gc_ or _${isPrefix}gcopt_ to show all setup options.”*\n\n`
      caption += groupDetails
      caption += `\n\n${global.footer}`

      m.reply(caption)
   },
   cache: true,
   owner: true,
   location: __filename
}