exports.run = {
  usage: ['ttp'],
  use: 'text',
  category: 'text maker',
  async: async (m, {
     client,
     command,
     isPrefix,
     Func,
     text
}) => {
 try {
    if(!text) return client.reply(m.chat, `Silahkan masukan teksnya\n\n contoh ${isPrefix}${command} Hallo Cuy`, m)
    await client.sendReact(m.chat, '🕒', m.key)
    let stiker = (`https://aemt.me/ttp?text=${encodeURIComponent(text)}`)
    let exif = global.db.setting
    client.sendSticker(m.chat, stiker , m, {
                        packname: exif.sk_pack,
                        author: exif.sk_author
                        })
     } catch (e) {
        client.reply(m.chat, Func.jsonFormat(e), m)    
     }
  },
  error: false,
  cache: true,
  limit : true,
  location: __filename
}