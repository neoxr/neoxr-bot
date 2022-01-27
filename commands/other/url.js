exports.run = {
   usage: ['short', 'expand'],
   async: async (m, {
      client,
      text,
      args,
      isPrefix,
      command
   }) => {
      try {
         if (command == 'short') {
            if (!text && !args) return client.reply(m.chat, Func.example(isPrefix, command, 'https://google.com'), m)
            let [url, custom] = text.split`|`
            if (!Func.isUrl(custom ? url.trim() : args[0])) return client.reply(m.chat, global.status.invalid, m)
            if (custom)
               if (custom.length < 5) return client.reply(m.chat, Func.texted('bold', `For customize enter min 6 character`), m)
            client.reply(m.chat, global.status.wait, m)
            let json = await Func.shorten2(custom ? url.trim() : args[0], custom ? custom.trim() : '')
            if (!json.status) return client.reply(m.chat, Func.texted('bold', `Fail to shorted!`), m)
            client.reply(m.chat, `• *Result* : ${json.data.url}`, m)
         } else if (command == 'expand') {
            if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, command == 'short' ? 'https://google.com' : 'http://neoxr.tk/QSOIA'), m)
            client.reply(m.chat, global.status.wait, m)
            let json = await Func.expand(args[0])
            if (!json.status) return client.reply(m.chat, Func.texted('bold', `Fail to expanded!`), m)
            client.reply(m.chat, `• *Result* : ${json.data.url}`, m)
         }
      } catch (e) {
         return client.reply(m.chat, Func.texted('bold', e.message), m)
      }
   },
   error: false,
   cache: true,
   location: __filename
}