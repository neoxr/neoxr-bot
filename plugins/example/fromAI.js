export const run = {
   usage: ['fromai'],
   category: 'example',
   async: async (m, {
      client,
      Utils
   }) => {
      try {
         // only work in private chat
         client.sendFromAI(m.chat, 'Hi!', m)
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   private: true
}