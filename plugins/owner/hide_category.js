exports.run = {
   usage: ['+hide', '-hide'],
   category: 'owner',
   async: async (m, {
      client,
      text,
      prefix,
      command,
      setting,
      ctx,
      Func
   }) => {
      try {
         const categories = [...new Set(Object.values(Object.fromEntries(Object.entries(ctx.plugins).filter(([name, prop]) => prop.run.category))).map(v => v.run.category))]
         if (!text) return client.reply(m.chat, Func.example(prefix, command, 'features'), m)
         if (!categories.includes(text.toLowerCase().trim())) return client.reply(m.chat, Func.texted('bold', `🚩 ${text} category does not exist.`), m)
         if (command == '+hide') {
            if (setting.hidden.includes(text.toLowerCase().trim())) return client.reply(m.chat, Func.texted('bold', `🚩 Category ${text} previously been hidden.`), m)
            setting.hidden.push(text.toLowerCase().trim())
            client.reply(m.chat, Func.texted('bold', `🚩 ${text} category successfully hidden.`), m)
         } else if (command == '-hide') {
            if (!setting.hidden.includes(text.toLowerCase().trim())) return client.reply(m.chat, Func.texted('bold', `🚩 ${text} category does not exist.`), m)
            setting.hidden.forEach((data, index) => {
               if (data === text.toLowerCase().trim()) setting.hidden.splice(index, 1)
            })
            client.reply(m.chat, Func.texted('bold', `🚩 ${text} category has been removed from hidden list.`), m)
         }
      } catch (e) {
         client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   owner: true,
   cache: true,
   location: __filename
}