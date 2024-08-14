exports.run = {
    usage: ['modapk'],
    use: 'query',
    category: 'search',
    async: async (m, {
      client,
      text,
      args,
      isPrefix,
      command,
      Func
    }) => {
       try {
        if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'Whatsapp'), m)
            client.sendReact(m.chat, '🕒', m.key)
            let json = await Func.fetchJson(`https://api.akuari.my.id/search/searchmod?query=${text}`)  
            let textt = "* MOD APK Search*\n\n Result From search  " + text + "\n\n───────────────────\n";
            json.respon.slice(0, 18).map(async (v, i) => {
                
           textt += `	◦  Name : ${v.title}\n	◦  Link : ${
          v.link
        }\n\n──────────────\n\n`;
            })
           m.reply(`${textt}`)
       } catch (e) {
      return client.reply(m.chat, global.status.error, m)
  }
  },
error: false,
limit: true,
verified: true,
premium: false,
}
