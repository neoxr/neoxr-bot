exports.run = {
  usage: ['text2img'],
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
        let result = (`https://aemt.me/v2/text2img?text=${encodeURIComponent(text)}`)
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