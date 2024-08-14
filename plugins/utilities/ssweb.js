exports.run = {
  usage: ['sspc', 'sstablet', 'ssmobile'],
  use: 'query',
  category: 'utilities',
  async: async (m, {
    client,
    text,
    args,
    isPrefix,
    command,
    Func
  }) => {
    try {
      if (command == 'sspc') {
      if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'Your url' ), m)
      client.sendReact(m.chat, '🕒', m.key)
      const aii = await Func.fetchBuffer(`https://api.betabotz.eu.org/api/tools/ssweb?url=${text}&device=desktop&apikey=beta-Ibrahim1209`)
      client.sendFile(m.chat, aii, '', `◦  *URL* : ${text}`, m)
    } else if (command == 'sstablet') {
      if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'Your url' ), m)
      client.sendReact(m.chat, '🕒', m.key)
      const aii = await Func.fetchBuffer(`https://api.betabotz.eu.org/api/tools/ssweb?url=${text}&device=tablet&apikey=beta-Ibrahim1209`)
      client.sendFile(m.chat, aii, '', `◦  *URL* : ${text}`, m)
  } else if (command == 'ssmobile') {
            if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'Your url' ), m)
      client.sendReact(m.chat, '🕒', m.key)
      const aii = await Func.fetchBuffer(`https://api.betabotz.eu.org/api/tools/ssweb?url=${text}&device=phone&apikey=beta-Ibrahim1209`)
      client.sendFile(m.chat, aii, '', `◦  *URL* : ${text}`, m)
        
      } 
    } catch (e) {
         console.log(e)
         return client.reply(m.chat, global.status.error, m)
      }
  },
  error: false,
  limit: true,
  premium: false,
}
