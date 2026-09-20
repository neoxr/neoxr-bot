export const run = {
   usage: ['ava'],
   use: 'mention or reply',
   category: 'group',
   async: async (m, {
      client,
      text,
      Utils
   }) => {
      try {
         let user = m.mentionedJid?.[0] || m.quoted?.sender
         const validate = Utils.validatePhone(text?.trim())

         if (text && validate.valid) {
            user = validate.jid_format
         } else if (text && !user) {
            const cleanNum = text.replace(/[^0-9]/g, '')
            if (cleanNum.length > 0 && cleanNum.length <= 16) {
               user = cleanNum + '@s.whatsapp.net'
            }
         }

         if (!user) return client.reply(m.chat, Utils.texted('bold', '🚩 Mention, reply, or enter a valid number target.'), m)

         const avatar = await client.profilePictureUrl(user, 'image').catch(() => null)
         if (!avatar) return client.reply(m.chat, Utils.texted('bold', "🚩 Target didn't put a profile picture."), m)

         client.sendFile(m.chat, avatar, '', '', m)
      } catch (e) {
         console.error(e)
         return client.reply(m.chat, global.status.error, m)
      }
   },
   error: false
}