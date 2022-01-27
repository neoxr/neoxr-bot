exports.run = {
   usage: ['topglobal'],
   async: async (m, {
      client,
      participants
   }) => {
      let point = Object.entries(global.users).sort((a, b) => b[1].point - a[1].point)
      let getUser = point.map(v => v[0])
      let show = Math.min(10, point.length)
      let teks = `❏  *T O P - G L O B A L*\n\n`
      teks += point.slice(0, show).map(([user, data], i) => (i + 1) + '. @' + user.split`@` [0] + '\n    *💴  :  ' + Func.formatNumber(data.point) + '*').join`\n`
      teks += `\n\n${global.setting.footer}`
      client.fakeStory(m.chat, teks, global.setting.header)
   },
   error: false
}