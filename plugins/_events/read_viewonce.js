/*
 * IMPORTANT: 
 * This feature requires the @neoxr/baileys library to function.
 */

export const run = {
   async: async (m, {
      client,
      groupSet
   }) => {
      try {
         if (!m.fromMe && m?.msg?.viewOnce && (m.isGroup ? groupSet.viewonce : true)) {
            const unwrapped = normalizeMessageContent(m.message)
            const type = MEDIA_TYPES.find(v => unwrapped?.[v])
            const message = type ? unwrapped[type] : null

            if (!type || !message?.viewOnce) return

            const { viewOnce, ...media } = message

            const content = {
               [type]: {
                  ...media,
                  contextInfo: {
                     ...media.contextInfo,
                     stanzaId: m?.key?.id || m?.id,
                     participant: m?.key?.participant || m?.key?.remoteJid,
                     quotedType: 0,
                     quotedMessage: m?.message
                  }
               }
            }

            await client.relayMessage(m.chat, content, {})
         }
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false
}