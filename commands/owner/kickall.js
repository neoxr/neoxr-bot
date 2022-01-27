exports.run = {
   usage: ['kickall'],
   async: async (m, {
      client,
      participants
   }) => {
      let member = participants.filter(v => v.admin === null).map(v => v.id)
      for (let i = 0; i < member.length; i++) {
         await Func.delay(1500)
         client.groupParticipantsUpdate(m.chat, [member[i]], 'remove')
      }
   },
   error: true,
   botAdmin: true,
   owner: true,
   cache: true,
   location: __filename
}