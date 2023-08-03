exports.run = {
   usage: ['+cmdstic', '-cmdstic'],
   use: 'text / command',
   category: 'owner',
   async: async (m, {
      client,
      text,
      command,
      Func
   }) => {
      if (command == '+cmdstic') {
         if (!m.quoted || !/webp/.test(m.quoted.mimetype)) return client.reply(m.chat, Func.texted('bold', `🚩 Reply sticker that will be used as sticker command.`), m)
         if (!text) return client.reply(m.chat, Func.texted('bold', `🚩 Berikan teks atau command.`), m)
         let hash = m.quoted.fileSha256.toString().replace(/,/g, '')
         if (typeof global.db.sticker[hash] != 'undefined') return client.reply(m.chat, `${Func.texted('bold', `🚩 Sticker is already in the database with text / command`)} : ${Func.texted('monospace', global.db.sticker[hash].text)}`, m)
         global.db.sticker[hash] = {
            text: text,
            created: new Date() * 1
         }
         client.reply(m.chat, `${Func.texted('bold', `🚩 Sticker successfully set as text / command`)} : ${Func.texted('monospace', text)}`, m)
      } else if (command == '-cmdstic') {
         if (!m.quoted || !/webp/.test(m.quoted.mimetype)) return client.reply(m.chat, Func.texted('bold', `🚩 Reply sticker that will be removed from the sticker command list.`), m)
         let hash = m.quoted.fileSha256.toString().replace(/,/g, '')
         if (typeof global.db.sticker[hash] == 'undefined') return client.reply(m.chat, Func.texted('bold', `🚩 Sticker is not in the database.`), m)
         delete global.db.sticker[hash]
         client.reply(m.chat, Func.texted('bold', `🚩 Sticker command successfully removed.`), m)
      }
   },
   owner: true
}