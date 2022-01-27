let moment = require('moment-timezone')
moment.tz.setDefault('Asia/Jakarta').locale('id')
exports.run = {
   usage: ['groupinfo'],
   async: async (m, {
      client,
      participants
   }) => {
      let {
         banned,
         mute,
         game,
         welcome,
         left,
         notify,
         spamProtect,
         localonly,
         nobadword,
         nolink,
         novirtex,
         expired,
         stay
      } = global.groups[m.chat]
      let pic = await Func.fetchBuffer('./media/images/default.jpg')
      let meta = await (await client.groupMetadata(m.chat))
      let member = participants.map(u => u.id)
      let admin = await client.groupAdmin(m.chat)
      let sider = []
      let day = 86400000 * 7,
         now = new Date() * 1
      member.map(v => {
         if (typeof global.groups[m.chat].member[v] == 'undefined' || typeof global.groups[m.chat].member[v] != 'undefined' && (global.groups[m.chat].member[v].lastseen == 0 || ((now - global.groups[m.chat].member[v].lastseen) > day) && !global.users[v].premium && !global.groups[m.chat].member[v].whitelist && !global.users[v].whitelist) && v != client.user.id.split(':')[0] + '@s.whatsapp.net') sider.push(v)
      })
      try {
         pic = await client.profilePictureUrl(m.chat, 'image')
      } catch {} finally {
         let caption = `❏  *G R O U P - I N F O*\n\n`
         caption += `	›  *Name* : ${meta.subject}\n`
         caption += `	›  *Member* : ${member.length}\n`
         caption += `	›  *Sider* : ${sider.length}\n`
         caption += `	›  *Admin* : ${admin.length}\n`
         caption += `	›  *Created* : ${moment(meta.creation * 1000).format('DD/MM/YY HH:mm:ss')}\n`
         caption += `	›  *Owner* : ${meta.owner ? '@' + meta.owner.split('@')[0] : m.chat.match('-') ? '@' + m.chat.split('-')[0] : ''}\n\n`
         caption += `❏  *M O D E R A T I O N*\n\n`
         caption += `	›  ${Func.switcher(nolink, '[ √ ]', '[ × ]')} Anti Group Link\n`
         caption += `	›  ${Func.switcher(novirtex, '[ √ ]', '[ × ]')} Anti Virtex\n`
         caption += `	›  ${Func.switcher(game, '[ √ ]', '[ × ]')} Games\n`
         caption += `	›  ${Func.switcher(left, '[ √ ]', '[ × ]')} Left Message\n`
         caption += `	›  ${Func.switcher(localonly, '[ √ ]', '[ × ]')} Localonly\n`
         caption += `	›  ${Func.switcher(notify, '[ √ ]', '[ × ]')} Spam Notification\n`
         caption += `	›  ${Func.switcher(spamProtect, '[ √ ]', '[ × ]')} Spam Protection\n`
         caption += `	›  ${Func.switcher(welcome, '[ √ ]', '[ × ]')} Welcome Message\n\n`
         caption += `❏  *G R O U P - S T A T U S*\n\n`
         caption += `	›  *Banned* : ${Func.switcher(banned, '√', '×')}\n`
         caption += `	›  *Muted* : ${Func.switcher(mute, '√', '×')}\n`
         caption += `	›  *Stay* : ${Func.switcher(stay, '√', '×')}\n`
         caption += `	›  *Expired* : ${expired == 0 ? 'NOT SET' : Func.timeReverse(expired - new Date * 1)}\n\n`
         caption += global.setting.footer
         client.sendImage(m.chat, pic, caption, m)
      }
   },
   group: true,
   cache: true,
   location: __filename
}