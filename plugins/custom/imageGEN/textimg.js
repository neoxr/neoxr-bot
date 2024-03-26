exports.run = {
  usage: ['textimg'],
  use: 'prompt',
  category: 'art',
  async: async (m, {
     client,
     text,
     isPrefix,
     command,
     Func
  }) => {
     try {
        if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'long hair girl'), m)
        await client.sendReact(m.chat, '🕒', m.key)
        let result = (`https://api.betabotz.eu.org/api/maker/text2img?text=${encodeURIComponent(text)}&apikey=MGgp85j5`)
        client.sendFile(m.chat, result, 'image.png', `*Prompt = ${text}*`, m)
     } catch (e) {
        client.reply(m.chat, Func.jsonFormat(e), m)
     }
  },
  error: false,
  limit: true,
  cache: true,
  location: __filename
}