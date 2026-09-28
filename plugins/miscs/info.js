export const run = {
   usage: ['info'],
   category: 'miscs',
   async: async (m, { client, Utils }) => {
      try {
         const text = `Information:\n\nThis bot script is a port from Baileys to ZapoJS and is currently in the debugging and testing phase.\n\nSome features may not work properly or may still be unstable. Bugs, errors, and unexpected behavior may occur during this stage.\n\nThis version is intended for testing and development purposes while compatibility and functionality are being improved.`

         m.reply(text)

      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false
}
