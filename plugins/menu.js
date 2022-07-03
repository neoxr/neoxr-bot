exports.run = {
   usage: ['menu', 'help', 'bot'],
   async: async (m, {
      client,
      isPrefix
   }) => {
      let rows = [{
         title: 'ADVANCE',
         rowId: `${isPrefix}menutype 1`,
         description: ``
      }, {
         title: 'GROUP',
         rowId: `${isPrefix}menutype 2`,
         description: ``
      }, {
         title: 'OWNER',
         rowId: `${isPrefix}menutype 3`,
         description: ``
      }]
      await client.sendList(m.chat, '', `An autonomous program on the internet or another network that can interact with systems or users.`, '', 'Tap!', [{
         rows
      }], m)
   },
   error: false
}