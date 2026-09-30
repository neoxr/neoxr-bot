export const run = {
   usage: ['link'],
   hidden: ['getlink'],
   category: 'group',
   async: async (m, {
      client
   }) => {
      try {
         await client.reply(m.chat, 'https://chat.whatsapp.com/' + (await client.groupInviteCode(m.chat)), m)
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   group: true,
   botAdmin: true
}