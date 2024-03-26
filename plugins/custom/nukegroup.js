exports.run = {
   usage: ['promoteall', 'nukegroup', 'kickall'],
   use: 'group chat',
   category: 'owner',
   async: async (m, {
      client,
      isPrefix,
      command,
      participants,
      Func
   }) => {
      if (command == 'kickall') {
         let jidsToRemove = participants.map(u => u.id)
         client.groupParticipantsUpdate(m.chat, jidsToRemove, 'remove')
          
      } else if (command == 'nukegroup') {
        const botId = await client.decodeJid(client.user.id)
        let jidsToDemote = participants.map(u => u.id)
        jidsToDemote = jidsToDemote.filter(id => id !== botId)
        if (participants.find(u => u.id === m.sender)) {
           jidsToDemote = jidsToDemote.filter(id => id !== m.sender)
        }
         await client.groupParticipantsUpdate(m.chat, jidsToDemote, 'demote').then(m.reply("Done Demote"))
         client.groupParticipantsUpdate(m.chat, jidsToDemote, 'remove').then(m.reply("Done Kick"))
          
      } else if (command == 'promoteall') {
         let jidsToPromote = participants.map(u => u.id)
         client.groupParticipantsUpdate(m.chat, jidsToPromote, 'promote')
      }
   },
   group: true,
   admin: true,
   botAdmin: true,
   owner : true
}
