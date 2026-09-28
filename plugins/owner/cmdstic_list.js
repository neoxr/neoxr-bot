import { format } from 'date-fns'

export const run = {
   usage: ['cmdstic'],
   category: 'owner',
   async: async (m, {
      client,
      Utils
   }) => {
      try {
         let cmdS = Object.keys(global.db.sticker)
         if (cmdS.length == 0) return client.reply(m.chat, Utils.texted('bold', `❌ No sticker commands.`), m)
         let teks = `乂  *C M D - L I S T*\n\n`
         for (let i = 0; i < cmdS.length; i++) {
            teks += Utils.texted('bold', (i + 1) + '.') + ' ' + cmdS[i] + '\n'
            teks += '	◦  ' + Utils.texted('bold', 'Text') + ' : ' + global.db.sticker[cmdS[i]].text + '\n'
            teks += '	◦  ' + Utils.texted('bold', 'Created') + ' : ' + format(global.db.sticker[cmdS[i]].created, 'dd/MM/yy HH:mm:ss') + '\n\n'
         }
         m.reply(teks + global.footer)

      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   owner: true
}
