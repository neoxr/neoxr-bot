exports.run = {
   usage: ['alien', 'brick', 'bunny', 'caricature', 'clown', 'ink', 'latte', 'letter', 'pencil', 'puzzle', 'roses', 'sketch', 'splash', 'staco'],
   use: 'reply foto',
   category: 'image effect',
   async: async (m, {
      client,
      isPrefix,
      command
   }) => {
      try {
         let q = m.quoted ? m.quoted : m
         let mime = (q.msg || q).mimetype || ''
         if (!/image\/(jpe?g|png)/.test(mime)) return client.reply(m.chat, Func.texted('bold', `🚩 Give a caption or reply to a photo with the command ${isPrefix + command}`), m)
         let img = await q.download()
         if (!img) return client.reply(m.chat, Func.texted('bold', `🚩 Give a caption or reply to a photo with the command ${isPrefix + command}`), m)
         client.sendReact(m.chat, '🕒', m.key)
         let old = new Date()
         let image = await scrap.uploadImage(img)
         let result = Api.ie(command.toLowerCase(), image)
         if (!result || result.constructor.name != 'String') return client.reply(m.chat, global.status.fail, m)
         client.sendFile(m.chat, result, ``, `🍟 *Process* : ${((new Date - old) * 1)} ms`, m)
      } catch (e) {
         console.log(e)
         return client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   limit: true
}