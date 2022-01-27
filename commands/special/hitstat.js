let moment = require('moment-timezone')
moment.tz.setDefault('Asia/Jakarta').locale('id')
exports.run = {
   usage: ['hitstat'],
   async: async (m, {
      client,
      text,
      isPrefix
   }) => {
      let stat = Object.keys(global.statistic)
      if (stat.length == 0) return client.reply(true, Func.texted('bold', `No command used.`))
      class Hit extends Array {
         total(key) {
            return this.reduce((a, b) => a + (b[key] || 0), 0)
         }
      }
      let sum = new Hit(...Object.values(global.statistic))
      let sorted = Object.entries(global.statistic).sort((a, b) => b[1].hitstat - a[1].hitstat)
      let prepare = sorted.map(v => v[0])
      let show = Math.min(10, prepare.length)
      let teks = `❏  *H I T S T A T*\n\n`
      teks += Func.texted('bold', `“The total is ${Func.formatNumber(sum.total('hitstat'))} hits.”`) + '\n\n'
      teks += sorted.slice(0, show).map(([cmd, prop], i) => (i + 1) + '. ' + Func.texted('bold', 'Command') + ' :  ' + Func.texted('monospace', isPrefix + cmd) + '\n    ' + Func.texted('bold', 'Hit') + ' : ' + Func.formatNumber(prop.hitstat) + 'x\n    ' + Func.texted('bold', 'Last Hit') + ' : ' + moment(prop.lasthit).format('DD/MM/YY HH:mm:ss')).join`\n`
      teks += `\n\n${global.setting.footer}`
      client.fakeStory(m.chat, teks, global.setting.header)
   },
   error: false,
   cache: true,
   location: __filename
}