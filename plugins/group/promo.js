export const run = {
   usage: ['promo'],
   hidden: ['hi', 'halo', 'hm'],
   category: 'group',
   async: async (m, {
      client,
      participants,
      Utils
   }) => {
      try {
         const members = participants.filter(v => !v.admin)
         const admins = participants.filter(v => v.admin)

         const result = await Promise.all(
            members.map(async (v) => {
               try {
                  const avatar = await client.profilePicture(v.lid)

                  if (!avatar) return null

                  return {
                     avatar,
                     id: v.id,
                     lid: v.lid
                  }
               } catch {
                  return null
               }
            })
         )

         const validResult = result.filter(Boolean)
         const contents = {}

         await Promise.all(
            validResult.map(async (member) => {
               const fetch = await Utils.getFile(member.avatar)

               const caption = `Hai @${member.lid.replace(/@.+/, '')} 👋\n\nJoin : https://chat.whatsapp.com/ChZKbb6yPPnKHtFv6elKMf`

               contents[member.lid] = {
                  type: 'image',
                  media: fetch.file,
                  mimetype: fetch.mime,
                  caption
               }
            })
         )

         if (!Object.keys(contents).length) return

         await client.message.send(m.chat, 'default', {
            mentions: validResult.map(v => v.lid),
            exclusive: {
               contents,
               device: 'primary',
               exclude: [...admins.map(v => v.lid)]
            }
         }).then(() => m.react('✅'))
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },

   group: true,
}
