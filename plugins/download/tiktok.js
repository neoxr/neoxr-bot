exports.run = {
   usage: ['tiktok', 'tikmp3', 'tikwm'],
   hidden: ['tt'],
   use: 'link',
   category: 'downloader',
   async: async (m, {
      client,
      args,
      isPrefix,
      command
   }) => {
      try {
         if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'https://vm.tiktok.com/ZSR7c5G6y/'), m)
         if (!args[0].match('tiktok.com')) return client.reply(m.chat, global.status.invalid, m)
         client.sendReact(m.chat, '🕒', m.key)
         let old = new Date()
         let json = await Api.tiktok(Func.ttFixed(args[0]))
         if (!json.status) return client.reply(m.chat, Func.jsonFormat(json), m)
         if (command == 'tiktok' || command == 'tt') return client.sendButton(m.chat, json.data.video, `If you want to get the *original sound* press the button below.\n🍟 *Fetching* : ${((new Date - old) * 1)} ms`, ``, m, [{
            buttonId: `${isPrefix}tikmp3 ${args[0]}`,
            buttonText: {
               displayText: 'Backsound'
            },
            type: 1
         }])
         if (command == 'tikwm') return client.sendButton(m.chat, json.data.videoWM, `If you want to get the *original sound* press the button below.\n🍟 *Fetching* : ${((new Date - old) * 1)} ms`, ``, m, [{
            buttonId: `${isPrefix}tikmp3 ${args[0]}`,
            buttonText: {
               displayText: 'Backsound'
            },
            type: 1
         }])
         if (command == 'tikmp3') return !json.data.audio ? client.reply(m.chat, global.status.fail, m) : client.sendFile(m.chat, json.data.audio, 'audio.mp3', '', m)
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