exports.run = {
   usage: ['emomix', 'emojimix'],
   async: async (m, {
      client,
      text,
      isPrefix,
      command
   }) => {
      try {
         let exif = global.setting
         if (!text) return client.reply(m.chat, Func.example(isPrefix, command, '😳😩'), m)
         let emo = Func.getEmo(text)
         if (emo.length != 2) return client.reply(m.chat, Func.texted('bold', `Give 2 emoticons to be mixed.`), m)
         let json = await Api.emojimix(emo[0] + emo[1])
         if (!json.status) return client.reply(m.chat, Func.texted('bold', `Emoticon is not supported.`), m)
         await client.sendSticker(m.chat, await Func.fetchBuffer(json.data.url), m, {
            pack: exif.sk_pack,
            author: exif.sk_author,
            categories: emo
         })
      } catch (e) {
         return client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   cache: true,
   location: __filename
}