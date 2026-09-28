export const run = {
   usage: ['chord'],
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
         if (!text) return client.reply(m.chat, Utils.example(isPrefix, command, 'lathi'), m)
         if (Utils.isUrl(text.trim())) return client.reply(m.chat, '❌ This command only accepts query keywords, not a URL.', m)

         await client.sendReact(m.chat, '🕒', m.key)
         const json = await Api.neoxr('/chord', {
            q: text.trim()
         })
         if (!json.status) return client.reply(m.chat, `❌ ${json.msg || 'An error occurred while processing the data.'}`, m)

         let caption = `${json.data.chord}\n\n`
         caption += global.footer

         client.reply(m.chat, caption, m)
         limitter()
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   limit: true,
   restrict: true
}
