export const run = {
   usage: ['sider'],
   use: '(option)',
   category: 'admin tools',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      participants,
      isBotAdmin,
      groupSet,
      Utils
   }) => {
      try {
         const members = participants.filter(v => !v.admin).map(v => v.id)
         const botJid = client.decodeJid(client.getCredentials()?.meJid)
         const week = 7 * 86400000
         const now = Date.now()

         const sider1 = []
         const sider2 = []

         for (const jid of members) {
            const data = groupSet.member?.[jid]
            if (!data) {
               sider2.push(jid)
            } else if (jid !== botJid && data.lastseen > 0 && now - data.lastseen > week) {
               sider1.push({ jid, ...data })
            }
         }

         sider1.sort((a, b) => a.lastseen - b.lastseen)

         const [opt] = args || []
         if (opt === '-y') {
            if (!isBotAdmin) return client.reply(m.chat, global.status.botAdmin, m)

            const targets = [...sider1.map(v => v.jid), ...sider2]
            if (!targets.length) return client.reply(m.chat, Utils.texted('bold', '❌ There are no siders in this group.'), m)

            for (const jid of targets) {
               await Utils.delay(2000)
               await client.groupParticipantsUpdate(m.chat, [jid], 'remove')
            }

            return client.reply(m.chat, Utils.texted('bold', `✅ Done, ${targets.length} siders successfully removed.`), m)
         }

         if (!sider1.length && !sider2.length) {
            return client.reply(m.chat, Utils.texted('bold', '❌ There are no siders in this group.'), m)
         }

         let caption = `乂  *S I D E R*\n\n`

         if (sider2.length) {
            caption += `“List of *${sider2.length}* members with no activity.”\n\n`
            caption += sider2.map(v => `   ◦  @${v.replace(/@.+/, '')}`).join('\n') + '\n\n'
         }

         if (sider1.length) {
            caption += `“List of *${sider1.length}* members not online for 1 week.”\n\n`
            caption += sider1.map(v => `   ◦  @${v.jid.replace(/@.+/, '')}\n        *Lastseen* : ${Utils.toDate(now - v.lastseen).split('D')[0]} days ago`).join('\n') + '\n\n'
         }

         caption += `*Note* : This feature will be accurate once the bot has been in the group for 1 week. Send *${isPrefix + command} -y* to remove them.\n\n`
         caption += global.footer

         client.reply(m.chat, caption, m)
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   admin: true,
   group: true
}
