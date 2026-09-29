export const run = {
   usage: ['owner'],
   category: 'miscs',
   async: async (m, {
      client,
      Config
   }) => {
      try {
      client.sendContact(m.chat, [{
         name: Config.owner_name,
         number: Config.owner,
         about: 'Owner & Creator'
      }], m, {
         org: 'Neoxr Network',
         website: 'https://api.neoxr.my.id',
         email: 'contact@neoxr.my.id'
      })
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false
}