export const run = {
   usage: ['link'],
   hidden: ['getlink'],
   category: 'group',
   async: async (m, {
      client
   }) => {
      try {
         const link = await client.groupInviteCode(m.chat, 'link')
         await client.reply(m.chat, link, m)

      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   group: true,
   botAdmin: true
}
