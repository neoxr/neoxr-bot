exports.run = {
   usage: ['premium'],
   category: 'special',
   async: async (m, {
      client,
      isPrefix
   }) => {
      client.reply(m.chat, `🏷️ Upgrade to premium plan only Rp. 10,000,- to get 1K limits for 1 month.\n\nIf you want to buy contact *${isPrefix}owner*`, m)
   },
   error: false,
   cache: true,
   location: __filename
}