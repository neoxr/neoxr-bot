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
      const types = command == 'hitstat' ? global.db.statistic : Object.fromEntries(Object.entries(global.db.statistic).filter(([_, prop]) => moment(prop.lasthit).format('DDMMYY') == moment(new Date).format('DDMMYY')))
      let stat = Object.keys(types)
      if (stat.length == 0) return client.reply(true, Utils.texted('bold', `🚩 No command used.`), m)
      class Hit extends Array {
         total(key) {
            return this.reduce((a, b) => a + (b[key] || 0), 0)
         }
      }
      let sum = new Hit(...Object.values(types))
      let sorted = command == 'hitstat' ? Object.entries(types).sort((a, b) => b[1].hitstat - a[1].hitstat) : Object.entries(types).sort((a, b) => b[1].today - a[1].today)
      let prepare = sorted.map(v => v[0])
      let show = Math.min(10, prepare.length)
      let teks = `乂  *H I T S T A T*\n\n`
      teks += Utils.texted('bold', `“Total command hit statistics ${command == 'hitstat' ? 'are currently' : 'for today'} ${Utils.formatNumber(command == 'hitstat' ? sum.total('hitstat') : sum.total('today'))} hits.”`) + '\n\n'
      teks += sorted.slice(0, show).map(([cmd, prop], i) => '   ┌ ' + Utils.texted('bold', 'Command') + ' :  ' + Utils.texted('monospace', isPrefix + cmd) + '\n   │ ' + Utils.texted('bold', 'Hit') + ' : ' + Utils.formatNumber(command == 'hitstat' ? prop.hitstat : prop.today) + 'x\n   └ ' + Utils.texted('bold', 'Last Hit') + ' : ' + format(prop.lasthit, 'dd/MM/yy HH:mm:ss')).join`\n\n`
      teks += `\n\n${global.footer}`
      client.sendMessageModify(m.chat, teks, m, {
         ads: false,
         largeThumb: true,
         thumbnail: Utils.isUrl(setting.cover) ? setting.cover : Buffer.from(setting.cover, 'base64'),
      })
   },
   error: false
}