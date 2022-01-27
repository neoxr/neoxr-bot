exports.run = {
   usage: ['sampah', 'sider'],
   async: async (m, {
      client,
      participants
   }) => {
      let member = participants.filter(u => u.admin == null).map(u => u.id)
      var day = 86400000 * 7,
         now = new Date() * 1
      let sider = []
      member.map(v => {
         if ((typeof global.users[v] == 'undefined' && typeof global.groups[m.chat].member[v] == 'undefined') && v != client.user.id.split(':')[0] + '@s.whatsapp.net') sider.push(v)
      })
      let lastseen = Object.entries(global.groups[m.chat].member).sort((a, b) => a[1].lastseen - b[1].lastseen).filter(([v, x]) => x.lastseen != 0 && ((now - x.lastseen > day) || (now - global.users[v].lastseen > day)) && !global.users[v].premium && !x.whitelist && !global.users[v].whitelist && v != client.user.id.split(':')[0] + '@s.whatsapp.net')
      let teks = `❏  *S I D E R*\n\n`
      teks += `“There are *${sider.length}* members in the ${await (await client.groupMetadata(m.chat)).subject} group who just joined.”\n\n`
      teks += sider.map(v => '	◦  @' + v.replace(/@.+/, '')).join('\n')
      teks += '\n\n'
      teks += `“There are *${lastseen.length}* members of the ${await (await client.groupMetadata(m.chat)).subject} group who have been inactive for more than 1 week.”\n\n`
      teks += lastseen.map(([v, x]) => '	◦  @' + v.replace(/@.+/, '') + '\n	     *Lastseen* : ' + Func.toDate(now - x.lastseen).split('D')[0] + ' days ago').join('\n')
      teks += `\n\n${global.setting.footer}`
      client.fakeStory(m.chat, teks, global.setting.header)
   },
   error: false,
   group: true
}