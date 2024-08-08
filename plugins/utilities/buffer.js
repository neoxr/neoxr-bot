exports.run = {
    usage: ['buffer'],
    use: 'image url',
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
        if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'image url'), m)
        client.sendReact(m.chat, '🕒', m.key)
        const aii = await Func.fetchBuffer(`${args[0]}`)
       client.sendFile(m.chat, aii, 'img.png', `◦  *URL* : ${args[0]}`, m)
        } catch (e) {
      return client.reply(m.chat, global.status.error, m)
  }
},
error: false,
limit: true,
premium: false,
verified: true,
}
