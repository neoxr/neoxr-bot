exports.run = {
   usage: ['igs'],
   hidden: ['igstory'],
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
         if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'https://instagram.com/stories/pandusjahrir/3064777897102858938?igshid=MDJmNzVkMjY= atau username'), m)
         if(!args[0].match(/instagram.com/)) return client.reply(m.chat, 'Maaf, link yang kamu masukkan tidak valid', m)
         if(args[0].match(/instagram.com/)) {
            client.sendReact(m.chat, '🕒', m.key)
            let old = new Date()
            const json = await Api.neoxr('/ig-fetch', {
               url: args[0]
            })
            if (!json.status) return client.reply(m.chat, global.status.fail, m)
               for (let i = 0; i < json.data.length; i++) {
                  client.sendFile(m.chat, json.data[i].url, Func.filename(json.data[i].type), `🍟 *Fetching* : ${((new Date - old) * 1)} ms`, m)
                  await Func.delay(1500)
               }
         } else {
            client.sendReact(m.chat, '🕒', m.key)
            let old = new Date()
            const json = await Api.neoxr('/igs', {
               username: args[0]
            })
            if (!json.status) return client.reply(m.chat, global.status.fail, m)
               for (let i = 0; i < json.data.length; i++) {
                  client.sendFile(m.chat, json.data[i].url, Func.filename(json.data[i].type), `🍟 *Fetching* : ${((new Date - old) * 1)} ms`, m)
                  await Func.delay(1500)
               }
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
