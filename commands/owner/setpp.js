exports.run = {
   usage: ['setpp'],
   async: async (m, {
      client
   }) => {
      try {
         if (!m.quoted) return client.reply(m.chat, Func.texted('bold', `Reply to the photo that will be used as a profile picture.`), m)
         let mime = ((m.quoted ? m.quoted : m.msg).mimetype || '')
         if (/image\/(jpe?g|png)/.test(mime)) {
            client.reply(m.chat, global.status.wait, m)
            let media = await client.saveMediaMessage(m.quoted)
            await client.updateProfilePicture(client.user.id, {
               url: media
            })
            await Func.delay(3000).then(() => client.reply(m.chat, Func.texted('bold', `Profile picture has been changed.`), m))
         }
      } catch (e) {
         console.log(e)
         return client.reply(m.chat, global.status.error, m)
      }
   },
   owner: true,
   error: false,
   cache: true,
   location: __filename
}