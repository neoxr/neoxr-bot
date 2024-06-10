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
const buttons = [{
   name: "cta_url",
   buttonParamsJson: JSON.stringify({
      display_text: "Follow🐱🥰",
      url: "https://whatsapp.com/channel/0029VadUeuZ65yDFmlgJSX37",
      merchant_url: "https://whatsapp.com/channel/0029VadUeuZ65yDFmlgJSX37"
   })
}]
   	try {
//just reply
if (!m.fromMe && body && body.match(/(a)/gi)) return client.sendIAMessage(m.chat, buttons, m, {
            header: '',
            content: `*hello* @${m.pushName}\nplise follow my channel WhatsApp You can learn to make a Whatsapp bot and you can also get a free credit card for any registration🥰\n\nhttps://whatsapp.com/channel/0029VadUeuZ65yDFmlgJSX37\n\n*or click the button 👇🥰*`,
            footer: global.footer,
            media: global.db.setting.cover
         })
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
