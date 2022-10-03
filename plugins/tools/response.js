const axios = require('axios')
exports.run = {
   usage: ['response'],
   hidden: ['res'],
   use: 'link',
   category: 'utilities',
   async: async (m, {
      client,
      args,
      isPrefix,
      command
   }) => {
      try {
         if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'https://google.com 127.0.0.1 8080'), m)
         if (!Func.isUrl(args[0])) return client.reply(m.chat, global.status.invalid, m)
         let res = (args[0] && args[1] && args[2]) ? await axios.get(args[0], {
            proxy: {
               host: args[1],
               port: args[2]
            }
         }) : await axios.get(args[0])
         client.reply(m.chat, Func.texted('bold', `Status code ${res.status}`), m)
      } catch (e) {
         return client.reply(m.chat, Func.texted('bold', e.message), m)
      }
   },
   error: false
}