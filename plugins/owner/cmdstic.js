export const run = {
   usage: ['+cmdstic', '-cmdstic'],
   use: 'text / command',
   category: 'owner',
   async: async (m, {
      client,
      text,
      command,
      Utils
   }) => {
      try {
         global.db.sticker = global.db.sticker || {}

         const q = m.quoted ? m.quoted : m
         const msg = client.message.get(q)

         if (!m.quoted || !/webp/i.test(msg.mimetype)) {
            const actionText = command === '+cmdstic' ? 'used as sticker command' : 'removed from the sticker command list'
            return client.reply(m.chat, Utils.texted('bold', `❌ Reply to the sticker that will be ${actionText}.`), m)
         }

         if (!msg.fileSha256) {
            return client.reply(m.chat, Utils.texted('bold', '❌ Cannot read sticker hash.'), m)
         }

         const hash = msg.fileSha256.toString().replace(/,/g, '')

         if (command === '+cmdstic') {
            if (!text) return client.reply(m.chat, Utils.texted('bold', '❌ Please provide a text or command.'), m)

            if (global.db.sticker[hash]) {
               return client.reply(m.chat, `${Utils.texted('bold', '❌ Sticker is already in the database with text / command')} : ${Utils.texted('monospace', global.db.sticker[hash].text)}`, m)
            }

            global.db.sticker[hash] = {
               text: text.trim(),
               created: Date.now()
            }

            return client.reply(m.chat, `${Utils.texted('bold', '✅ Sticker successfully set as text / command')} : ${Utils.texted('monospace', text.trim())}`, m)
         }

         if (command === '-cmdstic') {
            if (!global.db.sticker[hash]) {
               return client.reply(m.chat, Utils.texted('bold', '❌ Sticker is not in the database.'), m)
            }

            delete global.db.sticker[hash]
            return client.reply(m.chat, Utils.texted('bold', '✅ Sticker command successfully removed.'), m)
         }
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   owner: true
}
