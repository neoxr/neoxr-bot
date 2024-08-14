const fs = require('fs')
const axios = require('axios')
const decode = require('html-entities').decode
exports.run = {
   usage: ['get'],
   category: 'owner',
   async: async (m, {
      client,
      command,
      args,
      env,
      Func
   }) => {
      try {
        if (/get|fetch/i.test(command)) {
            if (!args || !args[0]) return client.reply(m.chat, Func.example(prefix, command, global.db.setting.cover), m)
            client.sendReact(m.chat, '🕒', m.key)
              const fetch = await axios.get(args[0], {
                  headers: {
                     "Access-Control-Allow-Origin": "*",
                     "Referer": "https://www.google.com/",
                     "Referrer-Policy": "strict-origin-when-cross-origin",
                     "User-Agent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36"
                  }
               })
               if (/json/i.test(fetch.headers['content-type'])) return m.reply(Func.jsonFormat(fetch.data))
               if (/text/i.test(fetch.headers['content-type'])) return m.reply(fetch.data)
               client.sendFile(m.chat, args[0], '', '', m) }
      } catch (e) {
         console.log(e)
         return client.reply(m.chat, e.message, m)
      }
   },
   owner: true,
   cache: true,
   location: __filename
}