exports.run = {
   usage: ['setmsg', 'setheader', 'setfooter', 'setwm', 'setcover'],
   async: async (m, {
      client,
      args,
      text,
      isPrefix,
      command
   }) => {
      let setting = global.setting
      if (command == 'setmsg') {
         if (!text) return client.reply(m.chat, `• ${Func.texted('bold', 'Example')} : ${isPrefix + command} I'am a Just Simple WhatsApp Bot`, m)
         setting.msg = text
         client.reply(m.chat, Func.texted('bold', `Menu Message successfully set.`), m)
      } else if (command == 'setheader') {
         if (!text) return client.reply(m.chat, `• ${Func.texted('bold', 'Example')} : ${isPrefix + command} JUST FOR FUN`, m)
         setting.header = text
         client.reply(m.chat, Func.texted('bold', `Header Message successfully set.`), m)
      } else if (command == 'setfooter') {
         if (!text) return client.reply(m.chat, `• ${Func.texted('bold', 'Example')} : ${isPrefix + command} Created by Wildan Izzudin`, m)
         setting.footer = text
         client.reply(m.chat, Func.texted('bold', `Footer Message successfully set.`), m)
      } else if (command == 'setwm') {
         if (!text) return client.reply(m.chat, `• ${Func.texted('bold', 'Example')} : ${isPrefix + command} Sticker by | @neoxrs`, m)
         let [packname, ...author] = text.split`|`
         author = (author || []).join`|`
         setting.sk_pack = packname || ''
         setting.sk_author = author || ''
         client.reply(m.chat, Func.texted('bold', `Sticker Watermark successfully set.`), m)
      } else if (command == 'setcover') {
         try {
            let q = m.quoted ? m.quoted : m
            let mime = (q.msg || q).mimetype || ''
            if (!/image/.test(mime)) return client.reply(m.chat, Func.texted('bold', `Image not found.`), m)
            client.reply(m.chat, global.status.wait, m)
            let img = await q.download()
            if (!img) return client.reply(m.chat, global.status.wrong, m)
            let link = await Func.uploadImage(img)
            setting.cover = link
            client.reply(m.chat, Func.texted('bold', `Cover successfully set.`), m)
         } catch {
            return client.reply(m.chat, global.status.error, m)
         }
      }
   },
   owner: true,
   cache: true,
   location: __filename
}