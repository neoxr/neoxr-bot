exports.run = {
   usage: ['group', 'setdesc', 'setname'],
   async: async (m, {
      client,
      text,
      args,
      isPrefix,
      command
   }) => {
      let value = m.quoted ? m.quoted.text : text
      if (command == 'group') {
         if (!args || !args[0]) return client.reply(m.chat, Func.texted('bold', `🚩 Enter argument close or open.`), m)
         if (args[0] == 'open') {
            await client.groupSettingUpdate(m.chat, 'not_announcement')
         } else if (args[0] == 'close') {
            await client.groupSettingUpdate(m.chat, 'announcement')
         }
      } else if (command == 'setname') {
         if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'CHATBOT'), m)
         if (text > 25) return client.reply(m.chat, Func.texted('bold', `🚩 Text is too long, maximum 25 character.`), m)
         await client.groupUpdateSubject(m.chat, text)
      } else if (command == 'setdesc') {
         await client.groupUpdateDescription(m.chat, text)
      }
   },
   group: true,
   admin: true,
   botAdmin: true
}