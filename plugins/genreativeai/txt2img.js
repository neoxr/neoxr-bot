exports.run = {
    usage: ['diffusion'],
    use: 'query',
    category: 'generativeai',
    async: async (m, {
      client,
      text,
      args,
      isPrefix,
      command,
      Func
    }) => {
       try {
        if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'cat,fish'), m)
        client.sendReact(m.chat, '🕒', m.key)
        const aii = await Func.fetchBuffer(`https://api.betabotz.eu.org/api/maker/text2img?text=${text}&apikey=beta-Ibrahim1209`)
       client.sendFile(m.chat, aii, '', `◦  *Prompt* : ${text}`, m)
        } catch (e) {
      return client.reply(m.chat, global.status.error, m)
  }
},
error: false,
limit: true,
premium: false,
verified: true,
}
