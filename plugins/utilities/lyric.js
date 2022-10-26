exports.run = {
   usage: ['lyric'],
   hidden: ['lirik'],
   use: 'query',
   category: 'utilities',
   async: async (m, {
      client,
      text,
      isPrefix,
      command
   }) => {
      try {
         if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'bad liar'), m)
         client.sendReact(m.chat, '🕒', m.key)
         let json = await Api.lyric(text)
         if (!json.status) return client.reply(m.chat, global.status.fail, m)
         client.sendMessageModify(m.chat, json.data.lyric, m, {
            title: `🎤 ${json.data.title}`,
            largeThumb: true,
            thumbnail: await Func.fetchBuffer(json.data.image)
         })
      } catch {
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   restrict: true
}