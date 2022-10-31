exports.run = {
   usage: ['link'],
   hidden: ['getlink'],
   category: 'group',
   async: async (m, {
      client
   }) => {
      await client.reply(m.chat, 'https://chat.whatsapp.com/' + (await client.groupInviteCode(m.chat)), m)
   },
   group: true,
   botAdmin: true
}