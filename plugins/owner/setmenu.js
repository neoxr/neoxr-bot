exports.run = {
   usage: ['setmenu'],
   use: '(option)',
   category: 'owner',
   async: async (m, {
      client,
      args,
      isPrefix,
      command
   }) => {
      try {
         let setting = global.db.setting.menuStyle
         if (!args || !args[0]) {
            let rows = [{
               title: `STYLE 1`,
               rowId: `${isPrefix + command} 1`,
               description: ''
            }, {
               title: `STYLE 2`,
               rowId: `${isPrefix + command} 2`,
               description: ''
            }]
            client.sendList(m.chat, '', `Choose menu style. 🍟`, '', 'Tap!', [{
               rows
            }], m)
         } else {
            client.reply(m.chat, `🚩 Bot menu successfully set using style *${args[0]}*.`, m).then(() => setting.menuStyle = parseInt(args[0]))
         }
      } catch (e) {
         console.log(e)
         return client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   owner: true
}