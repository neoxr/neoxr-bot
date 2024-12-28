exports.run = {
   usage: ['button'],
   async: async (m, {
      client,
      isPrefix,
      command,
      Func
   }) => {
      try {
         // Button 1 (NativeFlow / Template Message)
         const buttons1 = [{
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
               display_text: 'Runtime',
               id: `${isPrefix}run`
            })
         }, {
            name: 'single_select',
            buttonParamsJson: JSON.stringify({
               title: 'Tap Here!',
               sections: [{
                  rows: [{
                     title: 'Dummy 1',
                     // description: `X`,
                     id: `${isPrefix}run`
                  }, {
                     title: 'Dummy 2',
                     // description: `Y`,
                     id: `${isPrefix}run`
                  }]
               }]
            })
         }]
         client.sendIAMessage(m.chat, buttons1, m, {
            header: '',
            content: 'Hi!',
            footer: global.footer,
            media: global.db.setting.cover
         })

         await Func.delay(1200)

         // Button 2 (NativeFlow / Template Message)
         const buttons2 = [{
            buttonId: '.menu',
            buttonText: {
               displayText: 'Menu'
            }
         }, {
            buttonId: ".run",
            buttonText: {
               displayText: 'Runtime'
            }
         }]
         client.sendMessage(m.chat, {
            image: await Func.fetchBuffer(global.db.setting.cover),
            caption: 'Hi!',
            footer: global.footer,
            buttons: buttons2,
            viewOnce: true,
            headerType: 4
         }, { quoted: m })
      } catch (e) {
         client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   cache: true,
   location: __filename
}