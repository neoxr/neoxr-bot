export const run = {
   usage: ['play'],
   use: 'query',
   category: 'downloader',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      users,
      setting,
      Config,
      Utils
   }) => {
      try {
         if (!text) return client.reply(m.chat, Utils.example(isPrefix, command, 'lathi'), m)
         if (Utils.isUrl(text.trim())) return client.reply(m.chat, '❌ This command only accepts query keywords, not a URL.', m)

         const json = await Api.neoxr('/play', { q: text.trim() })
         if (!json.status) return client.reply(m.chat, `❌ ${json.msg || 'An error occurred while processing the data.'}`, m)

         client.sendFile(m.chat, json.data.url, json.data.filename, '', m)
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   limit: true,
   restrict: true
}