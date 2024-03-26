exports.run = {
   usage: ['tagme'],
   hidden: ['tagme'],
   use: 'text (optional)',
   category: 'admin tools',
   async: async (m, {
      client,
      text,
      participants,
      conn,
      Func
   }) => {
      try {
		let orang = (await client.groupMetadata(m.chat)).participants.map(u => u.jid)
		let tag = `@${m.sender.replace(/@.+/, '')}`
		let mentionedJid = [m.sender]
  		client.reply(m.chat, tag, m, { contextInfo: { mentionedJid }})
		} catch (e) {
         console.log(e)
         return client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true,
   cache: true,
   group: true,
   location: __filename
}