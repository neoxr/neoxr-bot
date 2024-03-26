exports.run = {
  usage: ['poll'],
  use: 'deskripsi|pilih1|pilih2|dst...',
  category: 'group',
  async: async (m, {
      client,
      Func,
      text,
      isPrefix,
      command,
  }) => {
    try{
      text = text.split(`|`)
      if (!text || text.length == 1) throw `Format :\n*${isPrefix + command} deskripsi|pilih1|pilih2|dst...*\n\nContoh :\n*${isPrefix + command} rombak admin|iya|tidak*`
      if (text.length > 1 && text.length < 3) throw `[!] Minimal input *2* pilihan!`
      if (text.length > 13) throw `[!] Pilihan terlalu banyak, maksimal *12* !`
      let array = []
      text.slice(1).forEach(function(i) { array.push(i) })
      client.sendPoll(m.chat, text[0], {
        options: array,
        multiselect: false
      })
    }catch(e){
      return client.reply(m.chat, Func.jsonFormat(e), m)
    }
  },
  error: false,
  limit: true,
  group: true,
}