export const run = {
   usage: ['google', 'goimg'],
   use: 'query',
   category: 'searching',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      Utils,
      limitter
   }) => {
      try {
         if (!text) return client.reply(m.chat, Utils.example(isPrefix, command, 'cat'), m)
         if (Utils.isUrl(text.trim())) return client.reply(m.chat, '❌ This command only accepts query keywords, not a URL.', m)

         await client.sendReact(m.chat, '🕒', m.key)

         if (command === 'google') {
            const json = await Api.neoxr('/google', {
               q: text.trim()
            })
            if (!json.status) return client.reply(m.chat, `❌ ${json.msg || 'An error occurred while processing the data.'}`, m)

            let caption = `乂  *G O O G L E - S E A R C H*\n\n`
            json.data.forEach((v, i) => {
               caption += `*${i + 1}. ${v.title}*\n`
               caption += `   ◦  *Snippet* : ${v.description}\n`
               caption += `   ◦  *Link* : ${v.url}\n\n`
            })
            caption += global.footer

            return client.reply(m.chat, caption, m)
         }

         if (command === 'goimg') {
            const json = await Api.neoxr('/goimg', {
               q: text.trim()
            })
            if (!json.status) return client.reply(m.chat, `❌ ${json.msg || 'An error occurred while processing the data.'}`, m)

            const randomItems = json.data.sort(() => 0.5 - Math.random()).slice(0, 5)

            for (const item of randomItems) {
               const file = await Utils.getFile(item.image)
               if (!file?.status || !/image\/(png|jpe?g)/i.test(file.mime)) continue

               let caption = `乂  *G O O G L E - I M A G E*\n\n`
               caption += `   ◦  *Title* : ${item.title || '-'}\n`
               caption += `   ◦  *Source* : ${item.source}\n\n`
               caption += global.footer

               client.sendFile(m.chat, item.image, '', caption, m)
               await Utils.delay(2500)
            }
         }
         limitter()
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   restrict: true,
   limit: true
}
