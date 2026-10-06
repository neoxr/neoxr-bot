import sharp from 'sharp'

sharp.cache(false)
sharp.concurrency(Math.max(1, Math.min(2, Number(process.env.SHARP_CONCURRENCY || 2))))

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
         const mime = (q.msg || q).mimetype || ''

         if (!/image/.test(mime)) return client.reply(m.chat, Utils.texted('bold', `❌ Image not found.`), m)

         client.sendReact(m.chat, '🕒', m.key)

         const buffer = await cropToLandscapeBuffer(await q.download())
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

/**
 * Crops an image buffer to a specified landscape aspect ratio.
 * @param {Buffer} inputBuffer - The input image buffer.
 * @param {number} aspectRatio - The desired aspect ratio (default is 16:9).
 * @param {Buffer} quality - Image quality. (default is 50)
 * @returns {Promise<Buffer>} - The cropped image buffer.
 */
const cropToLandscapeBuffer = async (inputBuffer, aspectRatio = 16 / 9, quality = 50) => {
   try {
      const image = sharp(inputBuffer)
      const metadata = await image.metadata()

      const { width, height } = metadata
      const currentAspectRatio = width / height

      let cropWidth, cropHeight

      if (currentAspectRatio > aspectRatio) {
         cropWidth = Math.floor(height * aspectRatio)
         cropHeight = height
      } else {
         cropWidth = width
         cropHeight = Math.floor(width / aspectRatio)
      }

      const left = Math.floor((width - cropWidth) / 2)
      const top = Math.floor((height - cropHeight) / 2)

      const outputBuffer = await image
         .extract({ left, top, width: cropWidth, height: cropHeight })
         .jpeg({ quality })
         .toBuffer()

      return outputBuffer
   } catch (error) {
      console.error('Error cropping image:', error.message)
   }
}