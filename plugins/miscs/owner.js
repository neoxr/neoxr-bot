export const run = {
   usage: ['owner'],
   category: 'miscs',
   async: async (m, {
      client,
      Config
   }) => {
      client.sendContact(m.chat, [{
         name: Config.owner_name,
         number: Config.owner,
         about: 'Owner & Creator'
      }], m, {
         org: 'Neoxr Network',
         website: 'https://api.neoxr.my.id',
         email: 'contact@neoxr.my.id'
      })
   },
   error: false
}