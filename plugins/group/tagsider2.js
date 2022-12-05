exports.run = {
   usage: ['tgs'],
   use: 'amount (optional)',
   category: 'group',
   async: async (m, {
      client,
      text,
      args,
      participants
   }) => {
      try {
         let member = participants.filter(u => u.admin == null).map(u => u.id)
         var day = 86400000 * 7,
            now = new Date() * 1
         var sider = []
         member.filter(jid => {
            if (!global.db.users.some(v => v.jid == jid) && typeof global.db.groups.find(v => v.jid == m.chat).member[jid] === 'undefined' && jid != client.decodeJid(client.user.id)) sider.push(jid)
         })
         var lastseen = Object.entries(global.db.groups.find(v => v.jid == m.chat).member).filter(([jid, data]) => data.lastseen).sort((a, b) => a[1].lastseen - b[1].lastseen).filter(([v, x]) => x.lastseen != 0 && ((now - x.lastseen > day) || (now - global.db.users.find(c => c.jid == v).lastseen > day)) && (global.db.users.some(c => c.jid == v) && !global.db.users.find(c => c.jid == v).premium && !global.db.users.find(c => c.jid == v).whitelist) && v != client.decodeJid(client.user.id))
         let arr = Object.entries(lastseen).map(([jid, _]) => jid).concat(sider)
         if (arr.length == 0) return client.reply(m.chat, Func.texted('bold', `🚩 There is no sider in this group.`), m)
         const amount = args[0] ? args[0] : 10
         for (let i = 0; i < parseInt(amount); i++) {
            await Func.delay(5000)
            await client.reply(m.chat, '.', null, {
               mentions: arr
            })
         }
      } catch (e) {
         client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   group: true,
   owner: true
}