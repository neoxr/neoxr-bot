exports.run = {
    usage: ['happymod'],
    use: 'prompt',
    category: 'downloader',
    async: async (m, {
       client,
       text,
       isPrefix,
       command,
       Func
    }) => {
       try {
          if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'wa mod'), m)
          client.sendReact(m.chat, '🕒', m.key)
          let json = await Func.fetchJson(`https://aemt.me/happymod?query=${encodeURIComponent(text)}`)
          let data = json.result
          client.reply(m.chat, data, m);
       } catch (e) {
          client.reply(m.chat, Func.jsonFormat(e), m)
       }
    },
    error: false,
    limit: true,
    premium: true,
    cache: true,
    location: __filename
 }
 