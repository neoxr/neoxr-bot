const category = ['anak', 'jawa', 'sunda', 'budaya', 'cinta', 'galau', 'gokil', 'inspiratif', 'jepang', 'kehidupan', 'keluarga', 'korea', 'kristen', 'liburan', 'lingkungan', 'malaysia', 'mengharukan', 'misteri', 'motivasi', 'nasihat', 'nasionalisme', 'olahraga', 'penantian', 'pendidikan', 'pengorbanan', 'penyesalan', 'perjuangan', 'perpisahan', 'persahabatan', 'petualangan', 'ramadhan', 'remaja', 'renungan', 'rindu', 'rohani', 'romantis', 'sastra', 'sedih', 'sejarah', 'terjemahan']
exports.run = {
   usage: category.map(v => `cerpen-${v}`),
   category: 'e-perpus',
   async: async (m, {
      client,
      command,
      Func
   }) => {
      try {
         client.sendReact(m.chat, '🕒', m.key)
         const json = await Api.neoxr('/cerpen', {
            category: command.split`-` [1].trim()
         })
         if (!json.status) return m.reply(Func.jsonFormat(json))
         let text = `*${json.data.title.toUpperCase()}*\n`
         text += `by ${json.data.author}\n\n`
         text += json.data.content
         client.reply(m.chat, text, m)
      } catch (e) {
         client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true
}