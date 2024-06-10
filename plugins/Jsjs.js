const fs = require("fs")
exports.run = {
   async: async (m, {
      client,
      body,
      Func,
      isBotAdmin,
      chats,
      setting
   }) => {
   	try {
//just reply
if (!m.fromMe && body && body.match(/(a|b|c)/gi)) return client.sendFile(m.chat, 'https://s4.neoxr.eu/get/Mfh1qh.jpg', 'image.jpg', `*hello* @${m.pushName}\nplise follow my channel WhatsApp You can learn to make a Whatsapp bot and you can also get a free credit card for any registration🥰\n\nhttps://whatsapp.com/channel/0029VadUeuZ65yDFmlgJSX37`, m)
      } catch (e) {
         console.log(e)
         client.reply(m.chat, Func.jsonFormat(e), m)
      }
function pickRandom(list) {
  return list[Math.floor(list.length * Math.random())]
}
   },
   error: false,
   group: true,
   cache: true,
   location: __filename
}
