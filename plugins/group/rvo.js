/*
 * IMPORTANT: 
 * This feature requires the @neoxr/baileys library to function.
 */

import { normalizeMessageContent } from 'baileys'

const MEDIA_TYPES = ['imageMessage', 'videoMessage', 'audioMessage']

export const run = {
   usage: ['rvo'],
   use: 'reply viewonce',
   category: 'group',
   async: async (m, {
      client,
      Utils,
      store
   }) => {
      try {
         if (!m.quoted) return client.reply(m.chat, Utils.texted('bold', `❌ Reply viewonce message to use this command.`), m)
         await client.sendReact(m.chat, '🕒', m.key)

         const history = await store.loadMessage(m.chat, m.quoted.id)
         if (!history?.message) return client.reply(m.chat, Utils.texted('bold', `❌ Message not found in history.`), m)

         const unwrapped = normalizeMessageContent(history.message)
         const type = MEDIA_TYPES.find(v => unwrapped?.[v])
         const message = type ? unwrapped[type] : null

         if (!type || !message) return client.reply(m.chat, Utils.texted('bold', `❌ Invalid viewOnce message.`), m)
         if (!message.viewOnce) return client.reply(m.chat, Utils.texted('bold', `❌ This is not a viewOnce message.`), m)

         const { viewOnce, ...media } = message

         const content = {
            [type]: {
               ...media,
               contextInfo: {
                  ...media.contextInfo,
                  stanzaId: history?.key?.id || history?.id,
                  participant: history?.key?.participant || history?.key?.remoteJid,
                  quotedType: 0,
                  quotedMessage: history?.message
               }
            }
         }

         await client.relayMessage(m.chat, content, {})
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   group: true
}