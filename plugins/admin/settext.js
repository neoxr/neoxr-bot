export const run = {
   usage: ['setwelcome', 'setleft'],
   hidden: ['setout'],
   use: 'text',
   category: 'admin tools',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      groupSet,
      Utils
   }) => {
      try {
         const isWelcome = command === 'setwelcome'

         if (!text) {
            return client.reply(m.chat, isWelcome ? formatWel(isPrefix, command) : formatLef(isPrefix, command), m)
         }

         if (isWelcome) {
            groupSet.text_welcome = text
         } else {
            groupSet.text_left = text
         }

         client.reply(m.chat, Utils.texted('bold', '✅ Successfully set.'), m)
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   admin: true,
   group: true
}

const formatWel = (prefix, command) => {
   return `Sorry, can't return without text, and this explanation and how to use :

*1.* +tag : for mention new member on welcome message.
*2.* +grup : for getting group name.

• *Example* : ${prefix + command} Hi +tag, welcome to +grup group, we hope you enjoyed with us.`
}

const formatLef = (prefix, command) => {
   return `Sorry, can't return without text, and this explanation and how to use :

*1.* +tag : for mention new member on left message.
*2.* +grup : for getting group name.

• *Example* : ${prefix + command} Good by +tag`
}
