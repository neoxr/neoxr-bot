exports.run = {
   usage: ['igs'],
   async: async (m, {
      client,
      args,
      isPrefix,
      command
   }) => {
      try {
         if (!args || !args[0]) return client.reply(m.chat, `• ${Func.texted('bold', `Example`)} :\n\n${isPrefix + command} hosico_cat\n${isPrefix + command} hosico_cat 2\n${isPrefix + command} https://instagram.com/stories/hosico_cat/2691705618766624203?utm_source=ig_story_item_share&utm_medium=copy_link`, m)
         client.reply(m.chat, global.status.getdata, m)
         let json = await Api.igs(/http?s/i.test(args[0]) ? args[0].split('/')[4] : args[0])
         if (!json.status) return client.reply(m.chat, Func.jsonFormat(json), m)
         if (args[0] && !isNaN(args[1])) {
            var no = args[1] - 1
            if (args[1] > json.data.length) return client.reply(m.chat, Func.texted('bold', `Sorry, story on @${args[0]} is ${json.data.length}`), m)
            json.data[no].type == 'mp4' ? client.sendVideo(m.chat, json.data[no].url, ``, m) : client.sendImage(m.chat, json.data[no].url, ``, m)
         } else {
            json.data.map(async v => {
               client.sendFile(m.chat, v.url, '', '', m)
               await Func.delay(1500)
            })
         }
      } catch (e) {
         console.log(e)
         return client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   cache: true,
   location: __filename
}