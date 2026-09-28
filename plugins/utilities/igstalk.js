export const run = {
   usage: ['igstalk'],
   use: 'username',
   category: 'utilities',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      Utils,
      limitter
   }) => {
      try {
         const [username] = args || []
         if (!username) return client.reply(m.chat, Utils.example(isPrefix, command, 'hosico_cat'), m)

         const cleanUser = username.replace(/[@]/g, '').replace(/(?:https?:\/\/)?(?:www\.)?instagram\.com\//i, '').replace(/[^a-zA-Z0-9._]/g, '')

         await client.sendReact(m.chat, '🕒', m.key)
         const json = await Api.neoxr('/igstalk', {
            username: cleanUser
         })
         if (!json.status) return client.reply(m.chat, `❌ ${json.msg || 'Account not found.'}`, m)

         const data = json.data
         let caption = `乂  *I G - S T A L K*\n\n`
         caption += `   ◦  *Username* : ${data.username || '-'}\n`
         caption += `   ◦  *Posts* : ${data.post}\n`
         caption += `   ◦  *Followers* : ${data.follower}\n`
         caption += `   ◦  *Followings* : ${data.following}\n`
         caption += `   ◦  *Bio* : ${data.about || '-'}\n`
         caption += `   ◦  *Private* : ${Utils.switcher(data.private, '√', '×')}\n\n`
         caption += global.footer

         client.sendFile(m.chat, data.photo, 'image.png', caption, m)
         limitter()
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   limit: true
}
