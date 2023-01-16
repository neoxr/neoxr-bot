exports.run = {
   usage: ['cnn'],
   hidden: ['cnnget'],
   category: 'utilities',
   async: async (m, {
      client,
      args,
      isPrefix,
      command
   }) => {
      try {
         if (command == 'cnn') {
            client.sendReact(m.chat, '🕒', m.key)
            const json = await Api.cnn()
            if (!json.status) return m.reply(Func.jsonFormat(json))
            let rows = []
            json.data.map(v => rows.push({
               title: v.title,
               rowId: `${isPrefix}cnnget ${v.url}`,
               description: ``
            }))
            client.sendList(m.chat, '', `Choose one to read news 🍟`, '', 'Tap!', [{
               rows
            }], m)
         } else if (command == 'cnnget') {
            if (!args || !args[0]) return
            client.sendReact(m.chat, '🕒', m.key)
            const json = await Api.cnn(args[0])
            if (!json.status) return m.reply(Func.jsonFormat(json))
            let text = `*${json.data.title.toUpperCase()}*\n`
            text += `Author by *${json.data.author}*\n`
            text += `Published at : *${json.data.posted_at}*\n\n`
            text += json.data.content + '\n\n'
            text += `Source : ${json.data.source}`
            client.sendMessageModify(m.chat, text, m, {
               largeThumb: true,
               thumbnail: await Func.fetchBuffer(json.data.thumbnail),
               link: json.data.source
            })
         }
      } catch (e) {
         client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true
}