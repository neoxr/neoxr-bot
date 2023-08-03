exports.run = {
   usage: ['igh'],
   use: 'link',
   category: 'downloader',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      Func
   }) => {
      try {
         if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'https://www.instagram.com/s/aGlnaGxpZ2h0OjE3OTIyODkwMzg5NTUyMjkz?story_media_id=2808645533965921761&igshid=NTc4MTIwNjQ2YQ=='), m)
         client.sendReact(m.chat, '🕒', m.key)
         let old = new Date()
         const json = await Api.neoxr('/ig-fetch', {
            url: args[0]
         })
         if (!json.status) return client.reply(m.chat, global.status.fail, m)
         for (let i = 0; i < json.data.length; i++) {
            client.sendFile(m.chat, json.data[i].url, ``, `🍟 *Fetching* : ${((new Date - old) * 1)} ms`, m)
            await Func.delay(1500)
         }
      } catch (e) {
         console.log(e)
         return client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true,
   cache: true,
   location: __filename
}