import baileys from '../../lib/engine.js'
const { S_WHATSAPP_NET } = baileys

export const run = {
   usage: ['setpp'],
   use: 'reply photo',
   category: 'owner',
   async: async (m, {
      client,
      Utils
   }) => {
      try {
         let q = m.quoted ? m.quoted : m
         let mime = ((m.quoted ? m.quoted : m.msg).mimetype || '')
         if (/image\/(jpe?g|png)/.test(mime)) {
            client.sendReact(m.chat, '🕒', m.key)
            const buffer = await q.download()
            const { img } = await generate(buffer)
            await client.query({
               tag: 'iq',
               attrs: {
                  to: S_WHATSAPP_NET,
                  type: 'set',
                  xmlns: 'w:profile:picture'
               },
               content: [
                  {
                     tag: 'picture',
                     attrs: {
                        type: 'image'
                     },
                     content: img
                  }
               ]
            })
            client.reply(m.chat, Utils.texted('bold', `🚩 Profile photo has been successfully changed.`), m)
         } else return client.reply(m.chat, Utils.texted('bold', `🚩 Reply to the photo that will be made into the bot's profile photo.`), m)
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   owner: true
}

async function generate(media) {
   const Jimp = (await import('jimp')).default
   const jimp = await Jimp.read(media)
   const min = jimp.getWidth()
   const max = jimp.getHeight()
   const cropped = jimp.crop(0, 0, min, max)
   return {
      img: await cropped.scaleToFit(720, 720).getBufferAsync(Jimp.MIME_JPEG),
      preview: await cropped.normalize().getBufferAsync(Jimp.MIME_JPEG)
   }
}