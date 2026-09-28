export const run = {
   usage: ['pinterest'],
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
         if (!text) return client.reply(m.chat, Utils.example(isPrefix, command, 'panda'), m)
         if (Utils.isUrl(text.trim())) return client.reply(m.chat, '❌ This command only accepts query keywords, not a URL.', m)

         await client.sendReact(m.chat, '🕒', m.key)
         const old = Date.now()

         const json = await Api.neoxr('/pinterest', {
            q: text.trim()
         })
         if (!json.status) return client.reply(m.chat, `❌ ${json.msg || 'An error occurred while processing the data.'}`, m)

         const items = json.data.sort(() => 0.5 - Math.random()).slice(0, 4)

          const files = items.map((v, i) => ({
            url: v,
            type: 'image',
            caption: i === 0 ? `🍟 *Fetching* : ${Date.now() - old} ms` : ''
         }))

         client.sendAlbumMessage(m.chat, files, m)
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
