const yts = require('yt-search')
exports.run = {
   usage: ['ytsearch'],
   hidden: ['yts', 'ytfind'],
   use: 'query',
   category: 'downloader',
   async: async (m, {
      client,
      text,
      isPrefix,
      command
   }) => {
      try {
         if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'lathi'), m)
         client.sendReact(m.chat, '🕒', m.key)
         const search = await (await yts(text)).all
         if (!search || search.length == 0) return client.reply(m.chat, global.status.fail, m)
         let rows = []
         search.map(v => rows.push({
            title: v.title,
            rowId: `${isPrefix}yt ${v.url}`,
            description: ``
         }))
         client.sendList(m.chat, '', `Showing search results for : “${text}”, select below the title you want to download. 🍟`, '', 'Tap!', [{
            rows
         }], m)
      } catch (e) {
         console.log(e)
         return client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   limit: true,
   restrict: true,
   cache: true,
   location: __filename
}