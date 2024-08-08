
exports.run = {
   usage: ['qc2'],
   use: 'text <𝘱𝘳𝘦𝘮𝘪𝘶𝘮>',
   category: 'converter',
   async: async (m, {
       client,
       text,
       isPrefix,
       command,
       Func
   }) => {
       try {
           if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'Hi!'), m);
           if (text.length > 30) return client.reply(m.chat, Func.texted('bold', `🚩 Max 30 characters.`), m);
           const exif = global.db.setting;
           let pic;
           try {
               pic = await client.profilePictureUrl(m.quoted ? m.quoted.sender : m.sender, 'image');
           } catch {
               pic = 'https://srv.neoxr.tk/files/z8hI5T.jpg';
           }
           const obj = {
               "type": "quote",
               "format": "png",
               "backgroundColor": "#FFFFFF",
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
           };
           const json = await axios.post('https://quote.btch.bz/generate', obj, {
               headers: {
                   'Content-Type': 'application/json'
               }
           });
           const buffer = Buffer.from(json.data.result.image, 'base64');
           client.sendSticker(m.chat, buffer, m, {
               packname: exif.sk_pack,
               author: exif.sk_author
           });
       } catch (e) {
           console.log(e);
           client.reply(m.chat, Func.texted('bold', `🚩 Can't generate sticker.`), m);
       }
   },
   error: false,
   limit: true,
   cache: true,
   verified: true,
   location: __filename
};