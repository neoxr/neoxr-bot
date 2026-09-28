import sharp from 'sharp'

export const run = {
   usage: ['toimg'],
   use: 'reply sticker',
   category: 'converter',
   async: async (m, {
      client,
      limitter,
      Utils
   }) => {
      try {
         if (!/sticker/gis.test(m?.quoted?.mtype)) return client.reply(m.chat, Utils.texted('bold', `❌ Reply to sticker or video you want to convert to an image/photo (not supported for sticker animation).`), m)
         if (/lottie/gis.test(m?.quoted?.mtype)) return client.reply(m.chat, Utils.texted('bold', `❌ Lottie Sticker is not supported.`), m)
         client.sendReact(m.chat, '🕒', m.key)
         const buffer = await sharp(await m.quoted.download())
            .png()
            .toBuffer()
         client.sendFile(m.chat, buffer, '', '', m)
         limitter()
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   limit: true
}