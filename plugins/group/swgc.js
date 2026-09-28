import { Converter } from '@neoxr/zapo'

export const run = {
   usage: ['swgc'],
   use: 'text or reply media',
   category: 'group',
   async: async (m, {
      client,
      text,
      command,
      users,
      Utils
   }) => {
      try {
         const q = m?.quoted ?? m
         const type = q.mtype

         if (/audio/.test(type)) {
            await client.sendReact(m.chat, '🕒', m.key)
            const origin = client.message.get(q)

            let message = {
               [type]: origin
            }

            if (!origin.ptt) {
               const buffer = await q.download()
               const convert = await Converter.toPTT(buffer)

               const result = await client.waUpload(convert, { type: 'audio' })

               message = {
                  audioMessage: {
                     ...result,
                     mimetype: 'audio/ogg; codecs=opus',
                     ptt: true
                  }
               }
            }

            client.groupStatus(m.chat, { message }, {
               private: {
                  name: 'Neoxr Creative',
                  emoji: '😈'
               }
            }).then(async () => {
               await client.sendReact(m.chat, '✅', m.key)
            })
         } else if (/image|video/.test(type)) {
            await client.sendReact(m.chat, '🕒', m.key)

            const message = {
               [type]: {
                  ...client.message.get(q),
                  ...(text ? { caption: text || q.text } : {})
               }
            }

            client.groupStatus(m.chat, { message }, {
               private: {
                  name: 'Neoxr Creative',
                  emoji: '😈'
               }
            }).then(async () => {
               await client.sendReact(m.chat, '✅', m.key)
            })
         } else if (text || q.text) {
            if (!text && q.text?.includes(command)) return client.reply(m.chat, Utils.texted('bold', '❌ Enter text or reply media.'), m)

            await client.sendReact(m.chat, '🕒', m.key)

            client.groupStatus(m.chat, { text: text || q.text }, {
               private: {
                  name: 'Neoxr Creative',
                  emoji: '😈'
               }
            }).then(async () => {
               await client.sendReact(m.chat, '✅', m.key)
            })
         } else return client.reply(m.chat, Utils.texted('bold', '❌ Enter text or reply media.'), m)
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   admin: true,
   group: true
}
