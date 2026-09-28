export const run = {
   usage: ['ig'],
   hidden: ['igdl'],
   use: 'link',
   category: 'downloader',
   async: async (m, {
      client,
      limitter,
      args,
      isPrefix,
      command,
      Utils
   }) => {
      const [argumen] = args
      try {
         if (!args || !argumen) return client.reply(m.chat, Utils.example(isPrefix, command, 'https://www.instagram.com/p/CK0tLXyAzEI'), m)
         if (!argumen.match(/(https:\/\/www.instagram.com)/gi)) return client.reply(m.chat, global.status.invalid, m)
         client.sendReact(m.chat, '🕒', m.key)
         let old = new Date()
         const json = await Api.neoxr('/ig', {
            url: Utils.igFixed(argumen)
         })
         if (!json.status) return client.reply(m.chat, Utils.jsonFormat(json), m)
         for (let v of json.data) {
            client.sendFile(m.chat, v.url, v.type == 'mp4' ? Utils.filename('mp4') : Utils.filename('jpg'), `🍟 *Fetching* : ${((new Date - old) * 1)} ms`, m)
            await Utils.delay(1500)
         }
         limitter()
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   limit: true
}