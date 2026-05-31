import fs from 'node:fs'

export const run = {
   usage: ['metamsg1', 'metamsg2', 'metamsg3'],
   category: 'example',
   async: async (m, {
      client,
      command,
      Config,
      Utils
   }) => {
      try {
         await client.sendReact(m.chat, '🕒', m.key)

         if (command === 'metamsg1') {
            client.sendMetaMsg(m.chat, [{
               text: `Hi @${m.sender.replace(/@.+/, '')} ✨, This is an example of a simple meta message (rich message) that supports *mentions*, *tables* and *code format*.\n\nAnd below is an example of the code format.`
            },
            {
               code: {
                  language: 'javascript',
                  code: fs.readFileSync('./error.js', 'utf-8')
               }
            },
            {
               text: `And this is an example of a table.`
            },
            {
               table: {
                  title: 'Data',
                  headers: ['Code', 'Artist'],
                  rows: [
                     ['SSID-738', 'Yua Mikami'],
                     ['RTXU-849', `@${m.sender.replace(/@.+/, '')}`]
                  ]
               }
            }, {
               text: 'You can add text, tables, and code formats as you like. 😎'
            },], m, {
               title: global.header,
               mentions: [m.sender]
            })
         }

         if (command === 'metamsg2') {
            client.sendMetaMsg(m.chat, [
               {
                  text: `This is an example of a meta message (rich message) that does not support *~mentions~*, but has many variations. Such as citations [](https://api.neoxr.eu) and links [Neoxr API](https://api.neoxr.eu).\n\nCode formatting and tables are working:`
               },
               {
                  code: {
                     language: 'javascript',
                     code: fs.readFileSync('./error.js', 'utf-8')
                  }
               },
               {
                  table: {
                     title: 'Data',
                     headers: ['Code', 'Artist'],
                     rows: [
                        ['SSID-738', 'Yua Mikami'],
                        ['RTXU-849', 'Momoka Nishina']
                     ]
                  }
               },
               {
                  muted: 'There is also muted text like this.'
               },
               {
                  suggestions: ['N', 'E', 'O', 'X', 'R', 'BOT']
               },
               {
                  sources: [{
                     icon: 'https://i.pinimg.com/736x/b4/e0/12/b4e012b9e55bc101eb2c89655888e2f1.jpg',
                     title: 'Github',
                     url: 'https://github.com/neoxr/neoxr-bot'
                  }]
               }], m, {
               title: global.header
            })
         }

         if (command === 'metamsg3') {
            client.sendMetaMsg(m.chat, [
               {
                  text: 'Photo and video media messages are supported, however, they do not support *~mentions~* and *~tables~*.\n\n---\n\nHere is an example of a reel:'
               },
               {
                  reels: [
                     'https://i.pinimg.com/736x/48/58/17/485817189f76066e8b22637d1310d3b4.jpg',
                     'https://i.pinimg.com/736x/0e/32/e3/0e32e35b0324a541ba7fe705330febde.jpg',
                     'https://i.pinimg.com/736x/88/78/b1/8878b18952e3587dd5c7502f35155731.jpg'
                  ].map(image => ({
                     creator: 'Neoxr Creative',
                     avatar: 'https://avatars.githubusercontent.com/u/52621597?v=4',
                     verified: true,
                     thumbnail: image,
                     url: 'https://api.neoxr.eu',
                     source: 'IG'
                  }))
               },
               {
                  text: '\n\n---\n\nHere is an example of a social media post:'
               },
               {
                  posts: [{
                     media: 'https://i.pinimg.com/736x/ba/fd/92/bafd92cf5c8fbd802cf59c51286fc13f.jpg',
                     caption: '하늘이 무너져도 솟아날 구멍은 있다는데, 난 그냥 그 구멍으로 들어가서 낮잠 잘래.',
                     source: 'FACEBOOK'
                  }, {
                     media: 'https://i.pinimg.com/1200x/ec/0a/fd/ec0afd363645fa73d9d17df1136fddd4.jpg',
                     caption: '냉장고랑 진지하게 대화했다. 걔는 자꾸 불빛을 깜빡이며 나한테 우주적 신호를 보내는 것 같아.',
                     source: 'THREADS'
                  }, {
                     media: 'https://i.pinimg.com/736x/53/dd/f9/53ddf9fcf881b704548f2b6c676b07a6.jpg',
                     caption: '어제 먹은 떡볶이가 사실 내 전생일지도 몰라. 쫄깃한 인생.',
                     source: 'INSTAGRAM'
                  }].map(v => ({
                     username: 'Neoxr Creative',
                     avatar: 'https://avatars.githubusercontent.com/u/52621597?v=4',
                     verified: true,
                     caption: v.caption,
                     url: 'https://api.neoxr.eu',
                     thumbnail: v.media,
                     source: v.source,
                     post_type: 'PHOTO'
                  }))
               },
               {
                  text: '\n\n---\n\nHere is an example of a non-slide product:\n\n'
               },
               {
                  products: {
                     title: 'Script Selfbot (WhatsApp Bot) [Free Update]',
                     image: 'https://imgkub.com/images/2026/01/14/image586735a7ca2a894a.jpg',
                     sale_price: 'Rp. 65.000',
                     brand: 'Neoxr Creative',
                     url: `https://wa.me/${Config.owner}`
                  }
               },
               {
                  text: '\n'
               },
               {
                  products: {
                     title: 'Payment Gateway',
                     image: 'https://imgkub.com/images/2026/01/22/image7af565014aadeae6.jpg',
                     sale_price: 'Rp. 80.000',
                     brand: 'Neoxr Creative',
                     url: `https://wa.me/${Config.owner}`
                  }
               },
               {
                  text: '\n\n---\n\nHere is an example of a slide product:'
               },
               {
                  products: [{
                     title: 'Script Premium (WhatsApp Bot) V5.1-Optima',
                     image: 'https://imgkub.com/images/2025/12/07/image6e1f9b94ba9ced64.jpg',
                     sale_price: 'Rp. 150.000'
                  }, {
                     title: 'Script E-Commerce (NeoCommerce)',
                     image: 'https://imgkub.com/images/2025/12/07/image42981ad8a7441ff7.jpg',
                     price: 'Rp. 175.000',
                     sale_price: 'Rp. 150.000'
                  }, {
                     title: 'Script Selfbot (WhatsApp Bot)',
                     image: 'https://imgkub.com/images/2026/01/14/image3b73a38fbc0a64c6.jpg',
                     sale_price: 'Rp. 55.000'
                  }, {
                     title: 'Temporary Uploader & URL Shortener',
                     image: 'https://imgkub.com/images/2025/12/13/imagef7b7c40836e6b3d2.jpg',
                     sale_price: 'Rp. 60.000'
                  }].map(v => ({
                     ...v,
                     brand: 'Neoxr Creative',
                     url: `https://wa.me/${Config.owner}`
                  }))
               }], m, {
               title: global.header
            })
         }
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false
}