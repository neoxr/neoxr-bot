const fs = require('fs')

exports.run = {
   usage: ['button1', 'button2', 'button3', 'button4', 'button5', 'button6'],
   category: 'example',
   async: async (m, {
      client,
      isPrefix,
      command,
      setting,
      Func
   }) => {
      try {
         switch (command) {
            case 'button1':
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
                  content: 'Hi! @0',
                  footer: global.footer,
                  media: Func.isUrl(setting.cover) ? setting.cover : Buffer.from(setting.cover, 'base64'),
               })
               break

            case 'button2': // Button 2 (Text Only)
               client.replyButton(m.chat, [{
                  text: 'Runtime',
                  command: '.runtime'
               }, {
                  text: 'Statistic',
                  command: '.stat'
               }], m, {
                  text: 'Hi @0',
                  footer: global.footer
               })
               break

            case 'button3': // Button 3 (Image & Video)
               client.replyButton(m.chat, [{
                  text: 'Runtime',
                  command: '.runtime'
               }, {
                  text: 'Statistic',
                  command: '.stat'
               }], m, {
                  text: 'Hi @0',
                  footer: global.footer,
                  media: fs.readFileSync('./media/image/default.jpg') // video or image (url or buffer)
               })
               break

            case 'button4': // Button 4 (Document)
               client.replyButton(m.chat, [{
                  text: 'Runtime',
                  command: '.runtime'
               }, {
                  text: 'Statistic',
                  command: '.stat'
               }], m, {
                  text: 'Hi @0',
                  footer: global.footer,
                  media: Func.isUrl(setting.cover) ? setting.cover : Buffer.from(setting.cover, 'base64'), // video or image link
                  document: {
                     filename: 'neoxr-cover.jpg'
                  }
               })
               break

            case 'button5': // Button 5 (Carousel)
               const cards = [{
                  header: {
                     imageMessage: global.db.setting.cover,
                     hasMediaAttachment: true,
                  },
                  body: {
                     text: "P"
                  },
                  nativeFlowMessage: {
                     buttons: [{
                        name: "cta_url",
                        buttonParamsJson: JSON.stringify({
                           display_text: 'Community',
                           url: global.db.setting.link,
                           webview_presentation: null
                        })
                     }]
                  }
               }, {
                  header: {
                     imageMessage: global.db.setting.cover,
                     hasMediaAttachment: true,
                  },
                  body: {
                     text: "P"
                  },
                  nativeFlowMessage: {
                     buttons: [{
                        name: "cta_url",
                        buttonParamsJson: JSON.stringify({
                           display_text: 'Neoxr API',
                           url: 'https://api.neoxr.eu',
                           webview_presentation: null
                        })
                     }]
                  }
               }]

               client.sendCarousel(m.chat, cards, m, {
                  content: 'Hi!'
               })
               break

            case 'button6': // Button 6 (Message Modify)
               client.replyButton(m.chat, [{
                  text: 'Runtime',
                  command: '.runtime'
               }, {
                  text: 'Statistic',
                  command: '.stat'
               }], m, {
                  text: 'Hi @0',
                  footer: global.footer,
                  docs: {
                     name: 'オートメーション',
                     pages: 20,
                     size: '1GB',
                     extension: 'ppt'
                  },
                  body: 'WhatsApp Automation',
                  thumbnail: Func.isUrl(setting.cover) ? setting.cover : Buffer.from(setting.cover, 'base64')
               })
               break
         }
      } catch (e) {
         client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   cache: true,
   location: __filename
}