/*
 * IMPORTANT: 
 * This feature requires the orignal baileys library to function.
 * Please refer to this PR for further information and updates:
 * https://github.com/WhiskeySockets/Baileys/pull/2201
 */

export const run = {
   async: async (m, {
      client,
      groupSet
   }) => {
      try {
         if (!m.fromMe && m?.msg?.viewOnce && (m.isGroup ? groupSet.viewonce : true)) {
            const type = Object.keys(m.message)?.[0]
            const message = m.message?.[type]

            if (!type || !message) return
            delete message.viewOnce

            const content = {
               [type]: {
                  ...message,
                  contextInfo: {
                     ...message.contextInfo,
                     stanzaId: m?.key?.id || m?.id,
                     participant: m?.key?.participant || m?.key?.remoteJid,
                     quotedType: 0,
                     quotedMessage: m?.message
                  }
               }
            }

            client.relayMessage(m.chat, content, {})
         }
      } catch (e) {
         console.error(e)
      }
   },
   error: false
}