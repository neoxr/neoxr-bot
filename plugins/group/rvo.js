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
         if (!history) return client.reply(m.chat, Utils.texted('bold', `❌ Message not found in history.`), m)

         
         const type = Object.keys(history.message)?.[0]
         const message = history.message?.[type]

         if (!type || !message) return

         if (!message.viewOnce) return client.reply(m.chat, Utils.texted('bold', `❌ Invalid viewOnce message.`), m)

         delete message.viewOnce

         const content = {
            [type]: {
               ...message,
               contextInfo: {
                  ...message.contextInfo,
                  stanzaId: history?.key?.id || history?.id,
                  participant: history?.key?.participant || history?.key?.remoteJid,
                  quotedType: 0,
                  quotedMessage: history?.message
               }
            }
         }

         client.relayMessage(m.chat, content, {})
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   owner: true
}
