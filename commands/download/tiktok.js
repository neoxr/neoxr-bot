exports.run = {
   usage: ['tiktok', 'tikmp3', 'tikwm'],
   async: async (m, {
      client,
      args,
      isPrefix,
      command
   }) => {
      try {
         if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'https://vt.tiktok.com/ZSe22y3dA'), m)
         client.reply(m.chat, global.status.getdata, m)
         let json = await Api.tiktok(Func.ttFixed(args[0]))
         if (!json.status) return client.reply(m.chat, Func.jsonFormat(json), m)
         if (command == 'tiktok') return client.sendButton(m.chat, json.data.video, 'If you want to download the audio / music from this video, press the button down below.', '', m, [{
            buttonId: `${isPrefix}tikmp3 ${args[0]}`,
            buttonText: {
               displayText: 'Audio'
            },
            type: 1
         }])
         if (command == 'tikwm') return client.sendButton(m.chat, json.data.videoWM, 'If you want to download the audio / music from this video, press the button down below.', '', m, [{
            buttonId: `${isPrefix}tikmp3 ${args[0]}`,
            buttonText: {
               displayText: 'Audio'
            },
            type: 1
         }])
         if (command == 'tikmp3') return !json.data.audio ? client.reply(m.chat, global.status.fail, m) : client.sendAudio(m.chat, json.data.audio, false, m)
      } catch (e) {
         console.log(e)
         return client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   cache: true,
   limit: true,
   location: __filename
}