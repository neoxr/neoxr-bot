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
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   private: true
}