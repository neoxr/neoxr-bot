export const run = {
   usage: ['photolive'],
   category: 'example',
   async: async (m, {
      client,
      Utils
   }) => {
      try {
         client.sendFile(m.chat, 'https://secure-signed.pages.dev/file/BAACAgUAAxkDAAECDDZqoeIgwK7hn82cv5gEQk0M0BCj6gADHgACj6kRVQkAAe0pFu2yZD0E', 'video.mp4', 'Hi @0', m, {
            photo_live: true,
         })
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false
}
