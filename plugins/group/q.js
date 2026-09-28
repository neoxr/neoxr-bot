export const run = {
   usage: ['q'],
   use: 'reply chat',
   category: 'group',
   async: async (m, {
      client,
      store,
      Utils
   }) => {
      try {
         if (!m.quoted) return client.reply(m.chat, Utils.texted('bold', `❌ Reply to message that contain quoted.`), m)

         const result = await store.loadMessage(m.chat, m.quoted.id)

         const quoted = result?.message?.[result.mtype].contextInfo?.quotedMessage
         if (!quoted) return client.reply(m.chat, Utils.texted('bold', `❌ Message does not contain quoted.`), m)

         await client.message.send(m.chat, quoted, { forward: { score: 4 } })
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false
}
