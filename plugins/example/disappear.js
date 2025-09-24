export const run = {
   usage: ['disappear'],
   category: 'example',
   async: async (m, {
      client,
      Utils
   }) => {
      try {
         // custom disappearing message
         client.reply(m.chat, 'Hi!', null, {
            disappear: 1234
         })
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   private: true
}