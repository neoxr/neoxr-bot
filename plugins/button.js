exports.run = {
   usage: ['button'],
   async: async (m, {
      client,
      isPrefix,
      command,
      Func
   }) => {
      try {
         const buttons = [{
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
         client.sendIAMessage(m.chat, buttons, m, {
            header: '',
            content: 'Hi!',
            footer: global.footer,
            media: global.db.setting.cover
         })
      } catch (e) {
         client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   cache: true,
   location: __filename
}