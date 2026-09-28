export const run = {
   usage: ['everyone'],
   hidden: ['tagall'],
   use: 'text (optional)',
   category: 'admin tools',
   async: async (m, {
      client,
      text,
      participants
   }) => {
      try {
         const members = participants.map(v => v.id)
         const readmore = String.fromCharCode(8206).repeat(4001)
         const groupSubject = text ? '' : (await client.groupMetadata(m.chat))?.subject || 'this'
         const message = text || `Hello everyone, an admin mentioned you in the ${groupSubject} group.`

         let caption = `乂  *E V E R Y O N E*\n\n`
         caption += `*“${message}”*\n`
         caption += readmore + '\n'
         caption += members.map(v => `◦  @${v.replace(/@.+/, '')}`).join('\n')

         client.reply(m.chat, caption, m)
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   admin: true,
   group: true
}
