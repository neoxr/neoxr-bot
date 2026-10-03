import { format } from 'date-fns'

export const run = {
   usage: ['groupinfo'],
   hidden: ['gcinfo'],
   category: 'group',
   async: async (m, {
      client,
      participants,
      groupSet,
      setting,
      Utils
   }) => {
      try {
         const meta = await client.groupMetadata(m.chat, false)
         const creator = meta.owner ? meta.owner.replace(/@.+/, '') : null
         const admin = client.getGroupAdmins(meta.participants)
         const member = participants.map(u => u.id)
         const picture = await client.profilePicture(m.chat).catch(() => null)

         let caption = `乂  *G R O U P - I N F O*\n\n`
         caption += `   ◦  *Name* : ${meta.subject}\n`
         caption += `   ◦  *Member* : ${member.length}\n`
         caption += `   ◦  *Admin* : ${admin.length}\n`
         caption += `   ◦  *Created* : ${format(meta.creation * 1000, 'dd/MM/yy HH:mm:ss')}\n`
         caption += `   ◦  *Owner* : ${creator ? `@${creator}` : '-'}\n\n`
         caption += `乂  *M O D E R A T I O N*\n\n`
         caption += `   ◦  ${Utils.switcher(groupSet.actinfo, '[ √ ]', '[ × ]')} Act Info\n`
         caption += `   ◦  ${Utils.switcher(groupSet.antidelete, '[ √ ]', '[ × ]')} Anti Delete\n`
         caption += `   ◦  ${Utils.switcher(groupSet.antilink, '[ √ ]', '[ × ]')} Anti Link\n`
         caption += `   ◦  ${Utils.switcher(groupSet.antivirtex, '[ √ ]', '[ × ]')} Anti Virtex\n`
         caption += `   ◦  ${Utils.switcher(groupSet.filter, '[ √ ]', '[ × ]')} Filter\n`
         caption += `   ◦  ${Utils.switcher(groupSet.antitagsw, '[ √ ]', '[ × ]')} Anti Story Tag\n`
         caption += `   ◦  ${Utils.switcher(groupSet.autosticker, '[ √ ]', '[ × ]')} Auto Sticker\n`
         caption += `   ◦  ${Utils.switcher(groupSet.norejoin, '[ √ ]', '[ × ]')} No Re-Join\n`
         caption += `   ◦  ${Utils.switcher(groupSet.left, '[ √ ]', '[ × ]')} Left Message\n`
         caption += `   ◦  ${Utils.switcher(groupSet.welcome, '[ √ ]', '[ × ]')} Welcome Message\n\n`
         caption += `乂  *G R O U P - S T A T U S*\n\n`
         caption += `   ◦  *Muted* : ${Utils.switcher(groupSet.mute, '√', '×')}\n`
         caption += `   ◦  *Stay* : ${Utils.switcher(groupSet.stay, '√', '×')}\n`
         caption += `   ◦  *Expired* : ${groupSet.expired === 0 ? 'NOT SET' : Utils.timeReverse(groupSet.expired - Date.now())}\n\n`
         caption += global.footer

         const icon = setting.icon ? (Utils.isUrl(setting.icon) ? setting.icon : Buffer.from(setting.icon, 'base64')) : null

         await client.sendMessageModify(m.chat, caption, m, {
            largeThumb: true,
            type: 'preview-link',
            ratio: 'square',
            thumbnail: picture,
            icon
         })
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   group: true
}
