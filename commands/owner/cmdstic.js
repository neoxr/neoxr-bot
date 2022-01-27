let moment = require('moment-timezone')
moment.tz.setDefault('Asia/Jakarta').locale('id')
exports.run = {
   usage: ['setcmd', 'delcmd', 'listcmd'],
   async: async (m, {
      client,
      text,
      command
   }) => {
      if (command == 'setcmd') {
         if (!m.quoted || !/webp/.test(m.quoted.mimetype)) return client.reply(m.chat, Func.texted('bold', `Reply sticker to be used as a command sticker.`), m)
         if (!text) return client.reply(m.chat, Func.texted('bold', `Give a text or command.`), m)
         let hash = m.quoted.fileSha256.toString().replace(/,/g, '')
         if (typeof global.sticker[hash] != 'undefined') return client.reply(m.chat, `${Func.texted('bold', `The sticker is already in the database with the text / command`)} : ${Func.texted('monospace', global.sticker[hash].text)}`, m)
         global.sticker[hash] = {
            text: text,
            created: new Date() * 1
         }
         client.reply(m.chat, `${Func.texted('bold', `Stickers have been set as text / command`)} : ${Func.texted('monospace', text)}`, m)
      } else if (command == 'delcmd') {
         if (!m.quoted || !/webp/.test(m.quoted.mimetype)) return client.reply(m.chat, Func.texted('bold', `Reply sticker that will be removed from the cmd list.`), m)
         let hash = m.quoted.fileSha256.toString().replace(/,/g, '')
         if (typeof global.sticker[hash] == 'undefined') return client.reply(m.chat, Func.texted('bold', `The sticker is not in the database.`), m)
         delete global.sticker[hash]
         client.reply(m.chat, Func.texted('bold', `Sticker command has been removed.`), m)
      } else if (command == 'listcmd') {
         let cmdS = Object.keys(global.sticker)
         if (cmdS.length == 0) return client.reply(m.chat, Func.texted('bold', `No sticker command.`), m)
         let teks = `❏  *C M D - L I S T*\n\n`
         for (let i = 0; i < cmdS.length; i++) {
            teks += Func.texted('bold', (i + 1) + '.') + ' ' + cmdS[i] + '\n'
            teks += '	›  ' + Func.texted('bold', 'Text') + ' : ' + global.sticker[cmdS[i]].text + '\n'
            teks += '	›  ' + Func.texted('bold', 'Created') + ' : ' + moment(global.sticker[cmdS[i]].created).format('DD/MM/YY HH:mm:ss') + '\n\n'
         }
         client.fakeStory(m.chat, teks + global.setting.footer, global.setting.header)
      }
   },
   owner: true
}