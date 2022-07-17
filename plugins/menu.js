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
         title: 'USER INFO',
         rowId: `${isPrefix}menutype 3`,
         description: ``
      }, {
         title: 'UTILITIES',
         rowId: `${isPrefix}menutype 4`,
         description: ``
      }, {
         title: 'OWNER TOOLS',
         rowId: `${isPrefix}menutype 5`,
         description: ``
      }]
      let text = 'An automated system (WhatsApp Bot) that can help to do something, search and get data / information only through WhatsApp.\n\n'
      text += '◦ *Database* : PostgreSQL\n'
      text += '◦ *Library* : Baileys v4.3.0\n'
      text += '◦ *Rest API* : https://api.neoxr.my.id\n'
      text += '◦ *Source* : https://github.com/neoxr/neoxr-bot\n\n'
      text += 'If you find an error or want to upgrade premium plan contact the owner.'
      await client.sendList(m.chat, '', text, '© neoxr-bot v2.2.0', 'Tap!', [{
         rows
      }], m)
   },
   error: false
}