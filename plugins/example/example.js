import fs from 'fs'

export const run = {
   usage: ['example'],
   hidden: ['button1', 'button2', 'button3', 'button4', 'button5', 'button6', 'button7', 'button8', 'button9', 'button10', 'button11'],
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
            case 'example': {
               const buttons = [{
                  name: 'single_select',
                  params: {
                     title: 'Select Example!',
                     sections: [{
                        rows: [{
                           title: 'Button Message',
                           description: `Text button message using buttonsMessage`,
                           id: `${isPrefix}button1`
                        }, {
                           title: 'Button Message (Media)',
                           description: `Button message with media (image/video) using buttonsMessage`,
                           id: `${isPrefix}button2`
                        }, {
                           title: 'Button Message (Location)',
                           description: `Button message with a custom location image using buttonsMessage`,
                           id: `${isPrefix}button3`
                        }, {
                           title: 'Button Message (Document)',
                           description: `Button message with a document using buttonsMessage`,
                           id: `${isPrefix}button4`
                        }, {
                           title: 'Button Message',
                           description: `Text button message using interactiveMessage`,
                           id: `${isPrefix}button5`
                        }, {
                           title: 'Button Message (Media + List)',
                           description: `Button message with media (image/video) and list using interactiveMessage`,
                           id: `${isPrefix}button6`
                        }, {
                           title: 'Button Message (Media + List) (Product)',
                           description: `Button message with media (image only) and list using interactiveMessage`,
                           id: `${isPrefix}button7`
                        }, {
                           title: 'Button Message (inapp_signup)',
                           description: `Button message with unique style using interactiveMessage`,
                           id: `${isPrefix}button8`
                        }, {
                           title: 'Button Message (inapp_signup + cta_copy)',
                           description: `Button message with unique style and copy button using interactiveMessage`,
                           id: `${isPrefix}button9`
                        }, {
                           title: 'Button Message (Carousel)',
                           description: `Button message carousel using interactiveMessage`,
                           id: `${isPrefix}button10`
                        }, {
                           title: 'Button Message (A2UI Widget)',
                           description: `Button message with a2ui widget using interactiveMessage`,
                           id: `${isPrefix}button11`
                        }, {
                           title: 'Rich Response Message 1',
                           description: `Rich response message with mention`,
                           id: `${isPrefix}metamsg1`
                        }, {
                           title: 'Rich Response Message 2',
                           description: `Rich response message advance + markdown`,
                           id: `${isPrefix}metamsg2`
                        }, {
                           title: 'Rich Response Message 3',
                           description: `Rich response message social media post + product`,
                           id: `${isPrefix}metamsg3`
                        }, {
                           title: 'Rich Response Message 4',
                           description: `Rich response message video with animation`,
                           id: `${isPrefix}metamsg4`
                        }, {
                           title: 'Rich Response Message 5',
                           description: `Rich response message image with animation`,
                           id: `${isPrefix}metamsg5`
                        }, {
                           title: 'Photo Live',
                           description: `Photo live message`,
                           id: `${isPrefix}photolive`
                        }, {
                           title: 'Poll Result',
                           description: `Show poll result max 12 data`,
                           id: `${isPrefix}pollresult`
                        }]
                     }],
                     icon: 'DEFAULT'
                  }
               }]

               client.replyButton(m.chat, buttons, m, {
                  content: `Hi @${m.sender?.replace(/@.+/, '')} 🍂\nHere are some examples of the advanced message types available in this bot script.`,
               })
               break
            }

            case 'button1': {
               const buttons = [{
                  text: 'Runtime',
                  command: '.runtime'
               }, {
                  text: 'Statistic',
                  command: '.stat'
               }]

               client.replyButton(m.chat, buttons, m, {
                  content: 'Hi @0',
                  footer: global.footer
               })

               break
            }

            case 'button2': {
               const buttons = [{
                  text: 'Runtime',
                  command: '.runtime'
               }, {
                  text: 'Statistic',
                  command: '.stat'
               }]

               client.replyButton(m.chat, buttons, m, {
                  content: 'Hi @0',
                  media: 'https://i.pinimg.com/736x/83/86/aa/8386aa39f5fea37b552a36206b95443c.jpg',
                  footer: global.footer
               })

               break
            }

            case 'button3': {
               const buttons = [{
                  text: '☰ List',
                  command: '-',
                  name: 'single_select',
                  params: {
                     title: 'Tap Here!',
                     sections: [{
                        rows: [{
                           title: 'Runtime',
                           id: `${isPrefix}run`
                        }, {
                           title: 'Statistic',
                           id: `${isPrefix}stat`
                        }]
                     }],
                     icon: 'DEFAULT'
                  }
               }, {
                  text: 'Statistic',
                  command: '.stat'
               }]

               client.replyButton(m.chat, buttons, m, {
                  content: 'Hi @0',
                  location: {
                     name: global.header,
                     description: 'オートメーション'
                  },
                  media: 'https://i.pinimg.com/736x/e9/84/8e/e9848e90f9a4cc57c839c6e579472169.jpg',
                  footer: global.footer
               })

               break
            }

            case 'button4': {
               const buttons = [{
                  text: 'Runtime',
                  command: '.runtime'
               }, {
                  text: 'Statistic',
                  command: '.stat'
               }]

               client.replyButton(m.chat, buttons, m, {
                  content: 'Hi @0',
                  document: {
                     filename: 'Capital Budgeting Analysis.xls'
                  },
                  media: 'https://exinfm.com/excel%20files/capbudg.xls',
                  footer: global.footer
               })

               break
            }

            case 'button5': {
               const buttons = [{
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({
                     display_text: 'Runtime',
                     id: `${isPrefix}run`,
                     icon: 'REVIEW'
                  }),
               }, {
                  name: 'cta_url',
                  buttonParamsJson: JSON.stringify({
                     display_text: 'Official Page',
                     url: 'https://neoxr.eu',
                     merchant_url: 'https://neoxr.eu'
                  })
               }]

               client.replyButton(m.chat, buttons, m, {
                  type: 'interactive',
                  content: 'Hi! @0'
               })

               break
            }

            case 'button6': {
               const buttons = [{
                  name: 'cta_url',
                  buttonParamsJson: JSON.stringify({
                     display_text: 'Official Page',
                     url: 'https://neoxr.eu',
                     merchant_url: 'https://neoxr.eu'
                  })
               }, {
                  name: 'single_select',
                  buttonParamsJson: JSON.stringify({
                     title: 'Tap Here!',
                     sections: [{
                        rows: [{
                           title: 'Runtime',
                           id: `${isPrefix}run`
                        }, {
                           title: 'Statistic',
                           id: `${isPrefix}stat`
                        }]
                     }],
                     icon: 'DEFAULT'
                  })
               }]

               client.replyButton(m.chat, buttons, m, {
                  type: 'interactive',
                  content: 'Hi! @0',
                  media: 'https://i.pinimg.com/736x/83/86/aa/8386aa39f5fea37b552a36206b95443c.jpg',
                  footer: global.footer
               })

               break
            }

            case 'button7': {
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
                           title: 'Runtime',
                           id: `${isPrefix}run`
                        }, {
                           title: 'Statistic',
                           id: `${isPrefix}stat`
                        }]
                     }],
                     icon: 'DEFAULT'
                  })
               }]

               client.replyButton(m.chat, buttons, m, {
                  title: global.header,
                  content: 'Hi! @0',
                  v2: true,
                  type: 'interactive',
                  media: 'https://i.pinimg.com/736x/83/86/aa/8386aa39f5fea37b552a36206b95443c.jpg',
                  footer: global.footer,
               })

               break
            }

            case 'button8': {
               const buttons = [{
                  name: 'inapp_signup',
                  buttonParamsJson: JSON.stringify({})
               }]

               client.replyButton(m.chat, buttons, m, {
                  title: global.header,
                  type: 'interactive',
                  content: 'Hi! @0'
               })

               break
            }

            case 'button9': {
               const buttons = [{
                  name: 'inapp_signup',
                  buttonParamsJson: JSON.stringify({
                     signup_id: '1885845738738391',
                     subscription_timestamp: String(Math.floor(Date.now() / 1000)),
                     promo_code: 'AKU YAHUDI'
                  })
               }]

               client.replyButton(m.chat, buttons, m, {
                  title: global.header,
                  type: 'interactive',
                  content: 'Hi! @0'
               })

               break
            }

            case 'button10': {
               const cards = [{
                  header: {
                     image: 'https://i.pinimg.com/736x/c7/2c/b0/c72cb05eb27c7d52e9cfa0cea059b1c8.jpg',
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
                           url: 'https://neoxr.eu',
                           webview_presentation: null
                        })
                     }]
                  }
               }, {
                  header: {
                     image: 'https://i.pinimg.com/736x/c7/2c/b0/c72cb05eb27c7d52e9cfa0cea059b1c8.jpg',
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

               client.replyButton(m.chat, [], m, {
                  title: global.header,
                  type: 'interactive',
                  content: 'Hi! @0',
                  cards
               })

               break
            }

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
                           title: 'Runtime',
                           id: `${isPrefix}run`
                        }, {
                           title: 'Statistic',
                           id: `${isPrefix}stat`
                        }]
                     }],
                     icon: 'DEFAULT'
                  })
               }]

               const uuid = Utils.uuid()

               client.replyButton(m.chat, buttons, m, {
                  content: '',
                  type: 'interactive',
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
                  footer: global.footer,
               })

               break
            }
         }
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
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
