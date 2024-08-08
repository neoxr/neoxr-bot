exports.run = {
    usage: ['math'],
    use: 'query',
    category: 'ai',
    async: async (m, {
      client,
      text,
      args,
      isPrefix,
      command,
      Func
    }) => {
       try {
        if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'what is java script'), m)
        client.sendReact(m.chat, '🕒', m.key)
        const json = await Func.fetchJson(`https://vihangayt.me/tools/mathssolve?q=${text}`)
        if (!json.status) return client.reply(m.chat, Func.jsonFormat(json), m)
        client.reply(m.chat, json.data, m)
        } catch (e) {
      return client.reply(m.chat, global.status.error, m)
  }
},
error: false,
limit: true,
premium: false,
verified: true,
}
