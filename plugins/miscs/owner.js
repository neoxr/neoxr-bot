export const run = {
   usage: ['owner'],
   category: 'miscs',
   async: async (m, {
      client,
      Config,
      Utils
   }) => {
      try {
         await client.sendContact(m.chat, {
            name: Config.owner_name,
            number: Config.owner,
            about: 'Owner & Creator'
         }, m, {
            org: 'Neoxr Network',
            website: 'https://neoxr.eu',
            email: 'contact@neoxr.my.id',
            address: { street: 'Jl. Asia Afrika No. 1', city: 'Bandung', region: 'Jawa Barat', postal: '40111', country: 'Indonesia' },
            geo: { lat: -6.9219, lng: 107.6071 }
         })
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false
}