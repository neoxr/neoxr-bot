exports.run = {
   usage: ['menu', 'help', 'bot'],
   async: async (m, {
      client,
      isPrefix
   }) => {
      let rows = [{
         title: 'DOWNLOADER',
         rowId: `${isPrefix}menutype 1`,
         description: ``
      }, {
         title: 'GROUP TOOLS',
         rowId: `${isPrefix}menutype 2`,
         description: ``
      }, {
         title: 'UTILITIES',
         rowId: `${isPrefix}menutype 3`,
         description: ``
      }, {
         title: 'OWNER TOOLS',
         rowId: `${isPrefix}menutype 4`,
         description: ``
      }]
      let text = 'An autonomous program on the internet or another network that can interact with systems or users.\n\n'
      text += '➠ *Database* : PosgreSQL\n'
      text += '➠ *Library* : Baileys v4.3.0\n'
      text += '➠ *Source* : https://github.com/neoxr/neoxr-bot *(v2.2.0)*\n'
      text += 'If you find an error or want to upgrade premium plan contact the owner.'
      await client.sendList(m.chat, '', text, '', 'Tap!', [{
         rows
      }], m)
   },
   error: false
}