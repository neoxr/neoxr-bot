import fs from 'fs'

export const run = {
   usage: ['button1', 'button2', 'button3', 'button4', 'button5', 'button6', 'button7', 'button8'],
   category: 'example',
   async: async (m, {
      client,
      isPrefix,
      command,
      setting,
      Utils
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
                  header: global.header,
                  content: 'Hi! @0',
                  v2: true,
                  footer: global.footer,
                  media: Utils.isUrl(setting.cover) ? setting.cover : Buffer.from(setting.cover, 'base64'),
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
                  media: Utils.isUrl(setting.cover) ? setting.cover : Buffer.from(setting.cover, 'base64'), // video or image link
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
                     imageMessage: Utils.isUrl(setting.cover) ? setting.cover : Buffer.from(setting.cover, 'base64'),
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
                  thumbnail: Utils.isUrl(setting.cover) ? setting.cover : Buffer.from(setting.cover, 'base64')
               })
               break

            case 'button7': {
               const buttons = [{
                  name: "quick_reply",
                  buttonParamsJson: JSON.stringify({
                     display_text: "Owner",
                     id: `${isPrefix}owner`
                  }),
               }, {
                  name: "cta_url",
                  buttonParamsJson: JSON.stringify({
                     display_text: "Rest API",
                     url: "https://api.neoxr.my.id",
                     merchant_url: "https://api.neoxr.my.id"
                  })
               }, {
                  name: "cta_copy",
                  buttonParamsJson: JSON.stringify({
                     display_text: "Copy",
                     copy_code: "123456"
                  })
               }, {
                  name: "cta_call",
                  buttonParamsJson: JSON.stringify({
                     display_text: "Call",
                     phone_number: "6285887776722"
                  })
               }, {
                  name: "single_select",
                  buttonParamsJson: JSON.stringify({
                     title: "Next Page",
                     sections: [{
                        rows: [{
                           title: "Owner",
                           description: `X`,
                           id: `${isPrefix}owner`
                        }, {
                           title: "Runtime",
                           description: `Y`,
                           id: `${isPrefix}run`
                        }]
                     }]
                  })
               }]

               client.sendIAMessage(m.chat, buttons, m, {
                  header: global.header,
                  content: 'Hi! @0',
                  v2: true,
                  footer: global.footer,
                  media: Utils.isUrl(setting.cover) ? setting.cover : Buffer.from(setting.cover, 'base64'),
                  multiple: {
                     name: 'オートメーション',
                     code: 'neoxr-bot',
                     list_title: 'Select Menu',
                     button_title: 'Tap Here!'
                  }
               })
               break
            }

            case 'button8':
               client.sendIAMessage(m.chat, [{
                  name: 'inapp_signup',
                  buttonParamsJson: JSON.stringify({})
               }], m, {
                  header: global.header,
                  content: 'Hi! @0'
               })
               break
         }
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false
}