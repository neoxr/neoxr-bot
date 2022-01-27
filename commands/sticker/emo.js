const {
   EmojiAPI
} = require('emoji-api')
const emoji = new EmojiAPI()
exports.run = {
   usage: ['emo', 'flat'],
   async: async (m, {
      client,
      args,
      isPrefix,
      command
   }) => {
      try {
         let exif = global.setting
         if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, '😑'), m)
         let emo = Func.getEmo(args[0])
         if (emo.length > 1) return client.reply(m.chat, Func.texted('bold', `Just for 1 emoticon.`), m)
         let json = await emoji.get(args[0])
         await client.sendSticker(m.chat, await Func.fetchBuffer(json.images[command == 'emo' ? 4 : 1].url), m, {
            pack: exif.sk_pack,
            author: exif.sk_author,
            categories: args[0]
         })
      } catch (e) {
         return client.reply(m.chat, require('util').format(e), m)
      }
   },
   error: false,
   cache: true,
   location: __filename
}