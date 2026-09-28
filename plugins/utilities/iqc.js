export const run = {
   usage: ['iqc'],
   use: 'text | time | chattime',
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
         if (!text) return client.reply(m.chat, Utils.example(isPrefix, command, `Hai | 20:20 | 04:30`), m)
         client.sendReact(m.chat, '🕒', m.key)
         let old = new Date()
         const [chat, time, chat_time] = text.split('|')
         const json = await Api.neoxr('/iqc', {
            text: chat.trim(),
            time: time?.trim(),
            chat_time: chat_time?.trim()
         })
         client.sendFile(m.chat, json.data.url, '', `🍟 *Fetching* : ${((new Date - old) * 1)} ms`, m)
         limitter()
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   limit: true
}