exports.run = {
   usage: ['setpp', 'setmsg', 'setwm'],
   async: async (m, {
      client,
      text,
      isPrefix,
      command
   }) => {
      let setting = global.db.setting
      if (command == 'setpp') {
         if (!m.quoted) return client.reply(m.chat, Func.texted('bold', `🚩 Reply to the photo that will be made into the bot's profile photo.`), m)
         let mime = ((m.quoted ? m.quoted : m.msg).mimetype || '')
         if (/image\/(jpe?g|png)/.test(mime)) {
            client.reply(m.chat, global.status.wait, m)
            let media = await client.saveMediaMessage(m.quoted)
            await client.updateProfilePicture(client.user.id, {
               url: media
            })
            await Func.delay(3000).then(() => client.reply(m.chat, Func.texted('bold', `🚩 Profile photo has been successfully changed.`), m))
         }
      } else if (command == 'setmsg') {
         if (!text) return client.reply(m.chat, Func.example(isPrefix, command, `Hello, how are you we currently offline now.`), m)
         setting.msg = text
         client.reply(m.chat, Func.texted('bold', `🚩 Greeting Message successfully set.`), m)
      } else if (command == 'setwm') {
         if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'Sticker by | @neoxrs'), m)
         let [packname, ...author] = text.split`|`
         author = (author || []).join`|`
         setting.sk_pack = packname || ''
         setting.sk_author = author || ''
         client.reply(m.chat, Func.texted('bold', `🚩 Sticker Watermark successfully set.`), m)
      }
   },
   owner: true,
   cache: true,
   location: __filename
}