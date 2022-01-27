exports.run = {
   usage: ['urban', 'urbandictionary', 'artinama'],
   async: async (m, {
      client,
      text,
      isPrefix,
      command
   }) => {
      try {
         if (!text) return client.reply(m.chat, Func.example(isPrefix, command, command != 'artinama' ? 'yntkts' : 'wildan'), m)
         let json = await scrap.urban(text)
         command != 'artinama' ? client.reply(m.chat, `${json.data.content}\n\n_${json.data.author}_`, m) : client.reply(m.chat, `${json.data.content}`, m)
      } catch {
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false
}