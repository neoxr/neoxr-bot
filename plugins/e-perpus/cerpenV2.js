const category = ['anak', 'daerah', 'inggris', 'jawa', 'sunda', 'budaya', 'cinta', 'terpendam', 'islami', 'pertama', 'romantis', 'sedih', 'segitiga', 'sejati', 'corona', 'rakyat', 'hewan', 'fiksi', 'fanfiction', 'galau', 'gokil', 'hantu', 'inspiratif', 'religi', 'jepang', 'kehidupan', 'keluarga', 'nyata', 'korea', 'kristen', 'liburan', 'lingkungan', 'humor', 'malaysia', 'mengharukan', 'misteri', 'motivasi', 'nasihat', 'nasionalisme', 'olahraga', 'hati', 'penantian', 'pendidikan', 'pribadi', 'pengorbanan', 'penyesalan', 'perjuangan', 'perpisahan', 'persahabatan', 'petualangan', 'ramadhan', 'remaja', 'renungan', 'rindu', 'rohani', 'romantis', 'sastra', 'sedih', 'sejarah', 'life', 'terjemahan', 'aksi']
exports.run = {
   usage: category.map(v => `cerpen-${v}`),
   category: 'e - perpus',
   async: async (m, {
      client,
      command
   }) => {
      try {
         client.sendReact(m.chat, '🕒', m.key)
         const json = await Api.cerpen(command.split`-` [1].trim())
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