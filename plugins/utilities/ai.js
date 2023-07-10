exports.run = {
   usage: ['ai', 'brainly'],
   category: 'utilities',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
   }) => {
      try {
         if (!m.quoted && !text) return client.reply(m.chat, Func.example(isPrefix, command, 'how to create an api'), m)
         if (m.quoted && !/conversation|extend/.test(m.quoted.mtype)) return m.reply(Func.texted('bold', `🚩 Text not found!`))
         client.sendReact(m.chat, '🕒', m.key)
         const json = await Api.gpt(text)
         if (!json.status) return m.reply(json.msg)
         client.reply(m.chat, json.data.message, m)
      } catch (e) {
         console.log(e)
         client.reply(m.chat, global.status.fail, m)
      }
   },
   limit: true,
   error: false
}