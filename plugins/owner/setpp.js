import baileys from '../../lib/engine.js'
const { S_WHATSAPP_NET } = baileys

import sharp from 'sharp'

sharp.cache(false)
sharp.concurrency(Math.max(1, Math.min(2, Number(process.env.SHARP_CONCURRENCY || 2))))

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
            client.reply(m.chat, Utils.texted('bold', `✅ Profile photo has been successfully changed.`), m)
         } else return client.reply(m.chat, Utils.texted('bold', `❌ Reply to the photo that will be made into the bot's profile photo.`), m)
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   owner: true
}

async function generate(media) {
   try {
      const base = sharp(media)

      const [img, preview] = await Promise.all([
         base.clone().resize(720, 720, { fit: 'inside' }).jpeg().toBuffer(),
         base.clone().normalise().jpeg().toBuffer()
      ])

      return {
         img,
         preview
      }
   } catch (e) {
      return {
         img: media,
         preview: media
      }
   }
}