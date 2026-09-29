import webpmux from 'node-webpmux'
const { Image } = webpmux
import { format } from 'util'

export const run = {
   usage: ['exif'],
   category: 'utilities',
   async: async (m, {
      client,
      Utils,
      limitter
   }) => {
      try {
         const q = m.quoted ? m.quoted : m
         const mime = (q.msg || q).mimetype || ''
         if (/(webp)/.test(mime)) {
            const buffer = await q.download()
            if (!buffer) return client.reply(m.chat, global.status.wrong, m)
            await client.sendReact(m.chat, '🕒', m.key)
            const result = await getWebpExif(buffer)
            client.reply(m.chat, format(result), m)
         } else return client.reply(m.chat, Utils.texted('bold', `Stress ??`), m)
         limitter()
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   limit: true
}

const getWebpExif = async (buffer) => {
   try {
      if (!buffer || !Buffer.isBuffer(buffer)) {
         return null
      }

      const img = new Image()
      await img.load(buffer)

      const exifBuffer = img.exif
      if (!exifBuffer) {
         return null
      }

      const exifString = exifBuffer.toString('utf-8')

      const jsonStart = exifString.indexOf('{')
      const jsonEnd = exifString.lastIndexOf('}')

      if (jsonStart === -1 || jsonEnd === -1) {
         return null
      }

      const jsonStr = exifString.substring(jsonStart, jsonEnd + 1)
      const parsedData = JSON.parse(jsonStr)

      return parsedData

   } catch (error) {
      return null
   }
}