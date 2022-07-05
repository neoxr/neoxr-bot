exports.run = {
   usage: ['g', 'get'],
   async: async (m, {
      client,
      args,
      isPrefix,
      command
   }) => {
      try {
         if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'https://file-examples-com.github.io/uploads/2017/10/file-example_PDF_1MB.pdf'), m)
         if (!Func.isUrl(args[0])) return client.reply(m.chat, Func.texted('bold', `URL is invalid!`), m)
         client.reply(m.chat, global.status.wait, m)
         return client.sendFile(m.chat, args[0], '', '', m)
      } catch (e) {
         console.log(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   quota: true
}