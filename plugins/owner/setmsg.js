exports.run = {
   usage: ['setmsg'],
   use: 'text',
   category: 'owner',
   async: async (m, {
      client,
      text,
      isPrefix,
      command
   }) => {
      try {
         let setting = global.db.setting
         if (!text) return client.reply(m.chat, explain(isPrefix, command), m)
         setting.msg = text
         client.reply(m.chat, Func.texted('bold', `🚩 Menu Message successfully set.`), m)
      } catch (e) {
         client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   owner: true,
   cache: true,
   location: __filename
}

const explain = (prefix, command) => {
   return `Sorry, can't return without text, and this explanation and how to use :

*1.* +tag : for mention sender.
*2.* +name : to getting sender name.
*3.* +greeting : to display greetings by time.

• *Example* : ${prefix + command} Hi +tag +greeting, i'm an automation system`
}