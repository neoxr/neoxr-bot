export const run = {
   usage: ['setdesc', 'setname'],
   use: 'text',
   category: 'admin tools',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      Utils
   }) => {
      try {
         const value = m.quoted?.text || text
         const isName = command === 'setname'

         if (isName) {
            if (!value) return client.reply(m.chat, Utils.example(isPrefix, command, 'CHATBOT'), m)
            if (value.length > 25) return client.reply(m.chat, Utils.texted('bold', '❌ Text is too long, maximum 25 characters.'), m)

            await client.group.setSubject(m.chat, value)
            return client.reply(m.chat, Utils.texted('bold', '✅ Group name has been successfully updated.'), m)
         }

         if (!value) return client.reply(m.chat, Utils.example(isPrefix, command, "Follow the rules if you don't want to be kicked."), m)

         const meta = await client.groupMetadata(m.chat, false)

         await client.group.setDescription(m.chat, value, meta.descId)
         client.reply(m.chat, Utils.texted('bold', '✅ Group description has been successfully updated.'), m)
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   group: true,
   admin: true,
   botAdmin: true
}
