const uploadFile = require ('../../lib/uploadFile')
const uploadImage = require ('../../lib/uploadImage')

exports.run = {
  usage: ['tourl'],
  use: 'reply media',
  category: 'converter',
  async: async (m, {
    client,
    Func
  }) => {
    try {
      let q = m.quoted ? m.quoted : m
      let mime = (q.msg || q).mimetype || ''
      if(!mime) return m.reply('Reply to media')
      client.sendReact(m.chat, '🕒', m.key)

      let media = await q.download()
      let isTele = /image\/(png|jpe?g|gif)|video\/mp4/.test(mime)
      let link = await (isTele ? uploadImage : uploadFile)(media)

      m.reply(`${link}
      ${media.length} Byte(s)
      ${isTele ? '(Tidak Ada Tanggal Kedaluwarsa)' : '(Tidak diketahui)'}`)

    } catch (e) {
      console.log(e)
      client.reply(m.chat, Func.jsonFormat(e), m)
    }
},
error: false,
cache: true,
location: __filename
}