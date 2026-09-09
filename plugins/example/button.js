import fs from 'fs'

export const run = {
   usage: ['button1', 'button2', 'button3', 'button4', 'button5', 'button6', 'button7', 'button8', 'button9', 'button10', 'button11'],
   category: 'example',
   async: async (m, {
      client,
      isPrefix,
      command,
      setting,
      store,
      Utils,
      Config
   }) => {
      try {
         switch (command) {
            case 'button1':
               const buttons = [{
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({
                     display_text: 'Runtime',
                     id: `${isPrefix}run`,
                     icon: 'REVIEW'
                  }),
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
                     }],
                     icon: 'DEFAULT'
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
                     imageMessage: 'https://i.pinimg.com/736x/c7/2c/b0/c72cb05eb27c7d52e9cfa0cea059b1c8.jpg',
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
                     imageMessage: 'https://i.pinimg.com/736x/c7/2c/b0/c72cb05eb27c7d52e9cfa0cea059b1c8.jpg',
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
                  content: 'Hi!',
                  store
               })
               break

            case 'button6': {
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

            case 'button7':
               client.sendIAMessage(m.chat, [{
                  name: 'inapp_signup',
                  buttonParamsJson: JSON.stringify({})
               }], m, {
                  header: global.header,
                  content: 'Hi! @0'
               })
               break

            case 'button8':
               client.sendIAMessage(m.chat, [{
                  name: 'inapp_signup',
                  buttonParamsJson: JSON.stringify({
                     signup_id: '1885845738738391',
                     subscription_timestamp: String(Math.floor(Date.now() / 1000)),
                     promo_code: 'AKU YAHUDI'
                  })
               }], m, {
                  header: global.header,
                  content: 'Hi! @0'
               })
               break

            case 'button9': {
               client.replyButton(m.chat, [{
                  text: '☰ List',
                  command: '-',
                  name: 'single_select',
                  params: {
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
                     }],
                     icon: 'DEFAULT'
                  }
               }, {
                  text: 'Statistic',
                  command: '.stat'
               }], m, {
                  text: 'Hi @0',
                  footer: global.footer,
                  location: {
                     name: global.header,
                     description: 'オートメーション'
                  },
                  media: 'https://i.pinimg.com/736x/e9/84/8e/e9848e90f9a4cc57c839c6e579472169.jpg' // url or buffer
               })
               break
            }

            case 'button10':
               client.sendIAMessage(m.chat, [{
                  name: 'booking_confirmation',
                  buttonParamsJson: JSON.stringify({
                     start_datetime: generateDateTimes().start_datetime,
                     end_datetime: generateDateTimes().end_datetime,
                     location: 'Indonesia',
                     booking_url: 'https://api.neoxr.eu/',
                     phone_number: String(Config.owner),
                     bookingmanagementurl: 'https://api.neoxr.eu/',
                     description: '어제 먹은 떡볶이가 사실 내 전생일지도 몰라. 쫄깃한 인생.',
                     email: 'contact@neoxr.my.id',
                     display_text: 'Open'
                  })
               }], m, {
                  header: global.header,
                  content: 'Hi! @0'
               })
               break

            case 'button11': {
               const buttons = [{
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({
                     display_text: 'Runtime',
                     id: `${isPrefix}run`,
                     icon: 'REVIEW'
                  }),
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
                     }],
                     icon: 'DEFAULT'
                  })
               }]

               const uuid = Utils.uuid()
               client.sendIAMessage(m.chat, buttons, m, {
                  header: '',
                  content: '',
                  widget: {
                     uuid: Utils.uuid(),
                     data: JSON.stringify({
                        version: 'v0.9',
                        createSurface: {
                           surfaceId: `starcore-widget=${uuid}`,
                           catalogId: 'https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json',
                           components: [{
                              id: 'root',
                              component: 'Column',
                              children: [
                                 'cover',
                                 'description'
                              ]
                           }, {
                              id: 'cover',
                              component: 'Image',
                              url: 'https://i.pinimg.com/736x/c7/2c/b0/c72cb05eb27c7d52e9cfa0cea059b1c8.jpg',
                              variant: 'header',
                              fit: 'none'
                           }, {
                              id: 'description',
                              component: 'Text',
                              text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
                              variant: 'body'
                           }]
                        }
                     }),
                     type: 'im_a2ui'
                  },
                  footer: global.footer
               })
            }
               break
         }
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false
}

function generateDateTimes(durationMinutes = 10) {
   const start = new Date()
   const end = new Date(start.getTime() + durationMinutes * 60000)

   return {
      start_datetime: start.toISOString(),
      end_datetime: end.toISOString()
   }
}