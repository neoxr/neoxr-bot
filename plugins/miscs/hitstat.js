import { format } from 'date-fns'

export const run = {
   usage: ['hitstat', 'hitdaily'],
   category: 'miscs',
   async: async (m, {
      client,
      isPrefix,
      command,
      setting,
      Utils
   }) => {
      try {
         const isAllTime = command === 'hitstat'
         const todayStr = format(Date.now(), 'ddMMyy')
         const stats = global.db?.statistic || {}

         const entries = Object.entries(stats).filter(([_, prop]) => {
            if (isAllTime) return true
            return prop?.lasthit ? format(prop.lasthit, 'ddMMyy') === todayStr : false
         })

         if (!entries.length) {
            return client.reply(m.chat, Utils.texted('bold', '❌ No command usage statistics found.'), m)
         }

         const statKey = isAllTime ? 'hitstat' : 'today'
         const totalHits = entries.reduce((acc, [, prop]) => acc + (prop[statKey] || 0), 0)

         entries.sort((a, b) => (b[1][statKey] || 0) - (a[1][statKey] || 0))
         const topTen = entries.slice(0, 10)

         let teks = `乂  *${isAllTime ? 'H I T S T A T' : 'H I T D A I L Y'}*\n\n`
         teks += Utils.texted('bold', `“Total command hit statistics ${isAllTime ? 'are currently' : 'for today'} ${Utils.formatNumber(totalHits)} hits.”`) + '\n\n'

         teks += topTen.map(([cmd, prop]) => {
            let card = `   ┌ ${Utils.texted('bold', 'Command')} : ${Utils.texted('monospace', isPrefix + cmd)}\n`
            card += `   │ ${Utils.texted('bold', 'Hit')} : ${Utils.formatNumber(prop[statKey] || 0)}x\n`
            card += `   └ ${Utils.texted('bold', 'Last Hit')} : ${prop.lasthit ? format(prop.lasthit, 'dd/MM/yy HH:mm:ss') : '-'}`
            return card
         }).join('\n\n')

         teks += `\n\n${global.footer}`

         const icon = setting.icon ? (Utils.isUrl(setting.icon) ? setting.icon : Buffer.from(setting.icon, 'base64')) : null

         await client.sendMessageModify(m.chat, teks, m, {
            largeThumb: true,
            type: 'preview-link',
            ratio: 'landscape',
            thumbnail: Utils.isUrl(setting.cover) ? setting.cover : Buffer.from(setting.cover, 'base64'),
            icon
         })
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false
}
