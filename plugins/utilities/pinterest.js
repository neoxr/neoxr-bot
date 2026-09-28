export const run = {
   usage: ['pinterest'],
   use: 'query',
   category: 'utilities',
   async: async (m, {
      client,
      limitter,
      text,
      isPrefix,
      command,
      Utils
   }) => {
      try {
         if (!text) return client.reply(m.chat, Utils.example(isPrefix, command, `panda`), m)
         client.sendReact(m.chat, '🕒', m.key)
         let old = new Date()
         const json = await Api.neoxr('/pinterest', {
            q: text
         })
         if (!json.status) return client.reply(m.chat, global.status.fail, m)
         for (let i = 0; i < 3; i++) {
            var rand = Math.floor(json.data.length * Math.random())
            client.sendFile(m.chat, json.data[rand], '', `🍟 *Fetching* : ${((new Date - old) * 1)} ms`, m)
            await Utils.delay(2000)
         }
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