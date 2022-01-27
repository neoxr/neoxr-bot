exports.run = {
   usage: ['pin'],
   async: async (m, {
      client,
      args,
      isPrefix,
      command
   }) => {
      try {
         if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'https://pin.it/5fXaAWE'), m)
         client.reply(m.chat, global.status.getdata, m)
         let json = await scrap.pin(args[0])
         if (!json.status) return client.reply(m.chat, Func.jsonFormat(json), m)
         if (/jpg|mp4/.test(json.data.type)) return client.sendFile(m.chat, json.data.url, '', '', m)
         if (json.data.type == 'gif') return client.sendFile(m.chat, json.data.url, '', '', m, {
            gif: true
         })
      } catch (e) {
         console.log(e)
         return client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   limit: true,
   cache: true,
   location: __filename
}