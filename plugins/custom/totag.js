exports.run = {
   usage: ['totag'],
   hidden: ['tag'],
   use: 'text (optional)',
   category: 'admin tools',
   async: async (m, {
      client,
      text,
      participants,
      conn,
      user,
      Func
   }) => {
    try { let users = participants.map(u => u.id).filter(v => v !== client.user.jid)
    if (!m.quoted) throw `Reply pesan`
    client.sendMessage(m.chat, { forward: m.quoted.fakeObj, mentions: users } )
	 } catch (err) {
    console.error('Caught an error:', err);
 		}	
        },
   error: false,
   premium: true,
   admin: false,
   limit: true,
   cache: true,
   group: true,
   location: __filename
}