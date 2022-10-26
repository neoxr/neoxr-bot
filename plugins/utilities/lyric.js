let lyricsParse = require('lyrics-parse')
const { decode } = require('html-entities')
exports.run = {
   usage: ['lirik'],
   use: 'query',
   // category: 'utilities',
   async: async (m, {
      client,
      text,
      isPrefix,
      command
   }) => {
      try {
         if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'lathi'), m)
         client.sendReact(m.chat, '🕒', m.key)
         let lyrics = await lyricsParse(text, '')
         lyrics ? client.reply(m.chat, unescape(decode(lyrics)), m) : client.reply(m.chat, global.status.fail, m)
      } catch {
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   restrict: true
}