export const run = {
   usage: ['igs'],
   hidden: ['igstory'],
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
         if (!args || !argumen) return client.reply(m.chat, Utils.example(isPrefix, command, 'https://instagram.com/stories/pandusjahrir/3064777897102858938?igshid=MDJmNzVkMjY='), m)
         client.sendReact(m.chat, '🕒', m.key)
         let old = new Date()
         const json = await Api.neoxr('/ig-fetch', {
            url: argumen
         })
         if (!json.status) return client.reply(m.chat, global.status.fail, m)
         for (let v of json.data) {
            const file = await Utils.getFile(v.url)
            client.sendFile(m.chat, v.url, Utils.filename(/mp4|bin/.test(file.extension) ? 'mp4' : 'jpg'), `🍟 *Fetching* : ${((new Date - old) * 1)} ms`, m)
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