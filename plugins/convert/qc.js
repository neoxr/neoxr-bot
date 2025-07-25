const axios = require('axios')

exports.run = {
   usage: ['qc'],
   use: 'text',
   category: 'converter',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      setting: exif,
      Func
   }) => {
      try {
         if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'Hi!'), m)
         if (text.length > 30) return client.reply(m.chat, Func.texted('bold', `🚩 Max 30 character.`), m)
         client.sendReact(m.chat, '🕒', m.key)
         let pic = await client.profilePictureUrl(m.quoted ? m.quoted.sender : m.sender, 'image')
         if (!pic) {
            pic = 'https://i.ibb.co/nsDv3ZJ/image.jpg'
         }
         const json = {
            "type": "quote",
            "format": "png",
            "backgroundColor": "#252525",
            "width": 512,
            "height": 768,
            "scale": 2,
            "messages": [{
               "entities": [],
               "avatar": true,
               "from": {
                  "id": 1,
                  "name": m.quoted ? global.db.users.find(v => v.jid == m.quoted.sender).name : m.pushName,
                  "photo": {
                     "url": pic
                  }
               },
               "text": text,
               "replyMessage": {}
            }]
         }
         const result = await (await axios.post('https://s.neoxr.eu/api/generate', json, {
            headers: {
               'Content-Type': 'application/json'
            }
         })).data
         const buffer = Buffer.from(result.data.image, 'base64')
         client.sendSticker(m.chat, buffer, m, {
            packname: exif.sk_pack,
            author: exif.sk_author
         })
      } catch (e) {
         console.log(e)
         client.reply(m.chat, Func.texted('bold', `🚩 Can't generate sticker.`), m)
      }
   },
   error: false,
   limit: true,
   cache: true,
   location: __filename
}