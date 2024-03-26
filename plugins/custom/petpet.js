const petPetGif = require('pet-pet-gif')

exports.run = {
  usage: ['petpet'],
  use: 'reply photo',
  category: 'converter',
  async: async (m, {
     client,
     text,
     isPrefix,
     command,
     Func,
     Scraper
  }) => {
     try {
      let exif = global.db.setting
      if (m.quoted ? m.quoted.message : m.msg.viewOnce) {
         let type = m.quoted ? Object.keys(m.quoted.message)[0] : m.mtype
         let q = m.quoted ? m.quoted.message[type] : m.msg
         if (/image/.test(type)) {
            client.sendReact(m.chat, '🕒', m.key)
            let img = await client.downloadMediaMessage(q)
            let image = await Scraper.uploadImageV2(img)
            const petpet = await petPetGif(image.data.url, {
                resolution: 128, // The width (or height) of the generated gif
                delay: 20, // Delay between each frame in milliseconds. Defaults to 20.
                backgroundColor: "rgba(255, 255, 255, 1)", // Other values could be the string "rgba(255, 255, 255, 1)". Defaults to null - i.e. transparent.
            })
            client.sendSticker(m.chat, petpet, m, {
               packname: exif.sk_pack,
               author: exif.sk_author
            })
         } else client.reply(m.chat, Func.texted('bold', 'Only for photo.'), m)
      } else {
         let q = m.quoted ? m.quoted : m
         let mime = (q.msg || q).mimetype || ''
         if (!mime) return client.reply(m.chat, Func.texted('bold', 'Reply photo.'), m)
         if (!/image\/(jpe?g|png)/.test(mime)) return client.reply(m.chat, Func.texted('bold', 'Only for photo.'), m)
         client.sendReact(m.chat, '🕒', m.key)
         let img = await q.download()
         let image = await Scraper.uploadImageV2(img)
		  const petpet = await petPetGif(image.data.url, {
                resolution: 128, // The width (or height) of the generated gif
                delay: 40, // Delay between each frame in milliseconds. Defaults to 20.
                backgroundColor: "rgba(255, 255, 255, 1)", // Other values could be the string "rgba(123, 233, 0, 0.5)". Defaults to null - i.e. transparent.
            })
            client.sendSticker(m.chat, petpet, m, {
               packname: exif.sk_pack,
               author: exif.sk_author
            })
      }
   } catch (e) {
      return client.reply(m.chat, Func.jsonFormat(e), m)
   }
  },
  error: false,
  limit: true,
  cache: true,
  location: __filename
}