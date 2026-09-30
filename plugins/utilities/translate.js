import translate from 'translate-google-api'

export const run = {
   usage: ['translate'],
   hidden: ['tr'],
   use: 'iso text',
   category: 'utilities',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      Utils
   }) => {
      try {
         if (!text) return client.reply(m.chat, Utils.example(isPrefix, command, 'id i love you'), m)
         if (text && m.quoted && m.quoted.text) {
            let lang = text.slice(0, 2)
            try {
               let data = m.quoted.text.replace(new RegExp('\n', 'g'), '‾')
               let result = await translate(`${data}`, {
                  to: lang
               })
               client.reply(m.chat, result[0].replace(new RegExp('‾', 'g'), '\n'), m)
            } catch (e) {
               console.error(e)
               client.reply(m.chat, global.status.error, m)
            }
         } else if (text) {
            let lang = text.slice(0, 2)
            try {
               let data = text.substring(2).replace(new RegExp('\n', 'g'), '‾')
               let result = await translate(`${data}`, {
                  to: lang
               })
               client.reply(m.chat, result[0].replace(new RegExp('‾', 'g'), '\n'), m)
            } catch (e) {
               console.error(e)
               client.reply(m.chat, global.status.error, m)
            }
         }
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false
}