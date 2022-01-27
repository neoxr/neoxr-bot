exports.run = {
   usage: ['toplocal'],
   async: async (m, {
      client,
      participants
   }) => {
      let member = participants.map(u => u.id)
      let kontol = {}
      for (i = 0; i < member.length; i++) {
         if (typeof global.users[member[i]] != 'undefined' && member[i] != client.user.id.split(':')[0] + '@s.whatsapp.net') {
            kontol[member[i]] = {
               point: global.users[member[i]].point,
               limit: global.users[member[i]].limit
            }
         }
      }
      let point = Object.entries(kontol).sort((a, b) => b[1].point - a[1].point)
      let limit = Object.entries(kontol).sort((a, b) => b[1].limit - a[1].limit)
      let rankPoint = point.map(v => v[0])
      let rankLimit = limit.map(v => v[0])
      let isPoint = Math.min(10, point.length)
      let isLimit = Math.min(10, limit.length)
      let teks = `❏  *T O P - L O C A L*\n\n`
      teks += `“Your points are ranked *${rankPoint.indexOf(m.sender) + 1}* out of *${member.length}* ${await (await client.groupMetadata(m.chat)).subject} group members.”\n\n`
      teks += point.slice(0, isPoint).map(([user, data], i) => (i + 1) + '. @' + user.split`@` [0] + '\n    *💴  :  ' + Func.simpFormat(Func.formatNumber(data.point)) + ' (' + Func.formatNumber(data.point) + ')*').join`\n`
      teks += `\n\n`
      teks += `“Your limits are ranked *${rankLimit.indexOf(m.sender) + 1}* out of *${member.length}* ${await (await client.groupMetadata(m.chat)).subject} group members.”\n\n`
      teks += limit.slice(0, isLimit).map(([user, data], i) => (i + 1) + '. @' + user.split`@` [0] + '\n    *🧱  :  ' + Func.formatNumber(data.limit) + '*').join`\n`
      teks += `\n\n${global.setting.footer}`
      client.fakeStory(m.chat, teks, global.setting.header)
   },
   error: false,
   group: true
}