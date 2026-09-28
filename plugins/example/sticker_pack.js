export const run = {
   usage: ['spack'],
   category: 'example',
   async: async (m, {
      client,
      Utils
   }) => {
      try {
         await client.sendStickerPack(m.chat, [
            'https://cdn.videy.co/7QUk0zRO1.mp4',
            { data: 'https://i.pinimg.com/736x/07/bf/a7/07bfa713160beb74c29b77bdb7c9debd.jpg', emojis: ['😺'] },
            { data: 'https://i.pinimg.com/736x/ff/42/4d/ff424d927ff03ec8b1e0e89d2547cad4.jpg', emojis: ['😂'] },
            'https://i.pinimg.com/736x/28/f0/2c/28f02c0145df8c303d8211c21e747128.jpg',
         ],
            m,
            {
               name: 'Pack Anjing Gemas',
               publisher: 'BotKu',
               description: 'Custom dari user',
               cover: './media/image/default.jpg'
            }
         )
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false
}
