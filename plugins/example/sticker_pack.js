export const run = {
   usage: ['spack'],
   category: 'example',
   async: async (m, {
      client,
      setting,
      Utils
   }) => {
      try {
         client.sendReact(m.chat, '🕒', m.key)

         const stickers = [
            'https://i.pinimg.com/736x/84/2b/14/842b14c54213c8115324d1efad21bb3e.jpg',
            { data: 'https://i.pinimg.com/736x/30/82/35/3082351c533bd4e27a2fa569f652ff8a.jpg', emojis: ['😺'] },
            { data: 'https://i.pinimg.com/736x/f0/e6/c7/f0e6c7be15e45d0e4e758565735a024e.jpg', emojis: ['😂'] },
            'https://i.pinimg.com/736x/4a/4c/e0/4a4ce081e6d12ab0a860fdfb4a7c89a7.jpg',
         ]

         client.sendStickerPack(m.chat, stickers, m, {
            name: 'Patrick Stickers',
            publisher: setting.sk_author,
            description: `${stickers.length} Stickers`,
            cover: './media/image/thumb.jpg'
         })
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false
}
