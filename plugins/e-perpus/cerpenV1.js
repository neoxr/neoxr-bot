exports.run = {
   usage: ['cerpen'],
   hidden: ['cerpenget'],
   use: 'category',
   category: 'e - perpus',
   async: async (m, {
      client,
      args,
      isPrefix,
      command
   }) => {
      try {
         if (command == 'cerpen') {
            client.sendReact(m.chat, '🕒', m.key)
            const json = await Api.cerpenList(args[0])
            if (!json.status && json.category_list) return m.reply(`*Category List* :\n\n${json.category_list.map(v => `- ${Func.ucword(v)}`).join('\n')}`)
            if (!json.status) return m.reply(Func.jsonFormat(json))
            let rows = []
            json.data.map(v => rows.push({
               title: v.title,
               rowId: `${isPrefix}cerpenget ${v.url}`,
               description: ``
            }))
            client.sendList(m.chat, '', `Choose one 🍟`, '', 'Tap!', [{
               rows
            }], m)
         } else if (command == 'cerpenget') {
            if (!args || !args[0]) return
            client.sendReact(m.chat, '🕒', m.key)
            const json = await Api.cerpenFetch(args[0])
            if (!json.status) return m.reply(Func.jsonFormat(json))
            let text = `*${json.data.title.toUpperCase()}*\n`
            text += `by ${json.data.author}\n\n`
            text += json.data.content
            client.reply(m.chat, text, m)
         }
      } catch (e) {
         client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true
}