exports.run = {
   usage: ['effect'],
   hidden: ['alien', 'brick', 'bunny', 'caricature', 'clown', 'ink', 'latte', 'letter', 'pencil', 'puzzle', 'roses', 'sketch', 'splash', 'staco'],
   use: 'reply foto',
   category: 'utilities',
   async: async (m, {
      client,
      args,
      isPrefix,
      command
   }) => {
      try {
         if (command == 'effect') {
            let q = m.quoted ? m.quoted : m
            let mime = (q.msg || q).mimetype || ''
            if (!/image\/(jpe?g|png)/.test(mime)) return client.reply(m.chat, Func.texted('bold', `🚩 Give a caption or reply to a photo with the command ${isPrefix + command}`), m)
            let img = await q.download()
            if (!img) return client.reply(m.chat, Func.texted('bold', `🚩 Give a caption or reply to a photo with the command ${isPrefix + command}`), m)
            client.sendReact(m.chat, '🕒', m.key)
            let image = await scrap.uploadImageV2(img)
            const style = ['alien', 'brick', 'bunny', 'caricature', 'clown', 'ink', 'latte', 'letter', 'pencil', 'puzzle', 'roses', 'sketch', 'splash', 'staco']
            let rows = []
            style.map(v => rows.push({
               title: v.toUpperCase(),
               rowId: `${isPrefix + v} ${image.data.url}`,
               description: ``
            }))
            client.sendList(m.chat, '', `Choose style you want 🍟`, '', 'Tap!', [{
               rows
            }], m)
         } else {
            if (!args || !args[0]) return
            if (!/telegra/i.test(args[0])) return
            let old = new Date()
            await client.sendReact(m.chat, '🕒', m.key)
            let result = Api.ie(command.toLowerCase(), args[0])
            if (!result || result.constructor.name != 'String') return client.reply(m.chat, global.status.fail, m)
            client.sendFile(m.chat, result, ``, `🍟 *Process* : ${((new Date - old) * 1)} ms`, m)
         }
      } catch (e) {
         console.log(e)
         return client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   limit: true
}