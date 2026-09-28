import sharp from 'sharp'

export const run = {
   usage: ['setcover'],
   hidden: ['cover'],
   use: 'reply foto',
   category: 'owner',
   async: async (m, {
      client,
      setting,
      Utils
   }) => {
      try {
         const q = m.quoted ? m.quoted : m
         const mime = client.message.get(q).mimetype || ''

         if (!/image/.test(mime)) return client.reply(m.chat, Utils.texted('bold', `❌ Image not found.`), m)

         client.sendReact(m.chat, '🕒', m)
         const buffer = await crop(await q.download())
         if (!buffer) throw new Error(global.status.wrong)

         setting.cover = Buffer.from(buffer).toString('base64')

         client.reply(m.chat, Utils.texted('bold', `✅ Cover successfully set.`), m)
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   owner: true
}

async function crop(inputBuffer, aspectRatio = 16 / 9, quality = 50) {
   try {
      const meta = await sharp(inputBuffer).metadata()
      const isRotated = (meta.orientation ?? 0) >= 5
      const width = isRotated ? (meta.height ?? 0) : (meta.width ?? 0)
      const height = isRotated ? (meta.width ?? 0) : (meta.height ?? 0)

      const currentRatio = width / height
      const cropWidth = currentRatio > aspectRatio ? Math.round(height * aspectRatio) : width
      const cropHeight = currentRatio > aspectRatio ? height : Math.round(width / aspectRatio)

      return await sharp(inputBuffer)
         .rotate()
         .resize(cropWidth, cropHeight, { fit: 'cover', position: 'center' })
         .jpeg({ quality })
         .toBuffer()
   } catch (error) {
      console.error('Error cropping image:', error.message)
   }
}
