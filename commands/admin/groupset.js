exports.run = {
   usage: ['group', 'setdesc', 'setname'],
   async: async (m, {
      client,
      text,
      args,
      isPrefix,
      command
   }) => {
      let value = quoted ? quoted.text : text
      if (command == 'group') {
         if (!args || !args[0]) return client.reply(m.chat, Func.texted('bold', `Select option open / close`))
         if (args[0] == 'open') {
            await client.groupSettingUpdate(m.chat, 'not_announcement')
         } else if (args[0] == 'close') {
            await client.groupSettingUpdate(m.chat, 'announcement')
         }
      } else if (command == 'setname') {
         if (!text) return client.reply(m.chat, Func.texted('bold', `Where is the text ?`), m)
         if (text > 25) return client.reply(m.chat, Func.texted('bold', `Text is too long.`), m)
         await client.groupUpdateSubject(m.chat, text)
      } else if (command == 'setdesc') {
         await client.groupUpdateDescription(m.chat, text)
      }
   },
   group: true,
   admin: true,
   botAdmin: true
}