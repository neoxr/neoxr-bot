export const run = {
   usage: ['add', 'promote', 'demote', 'kick'],
   use: 'mention or reply',
   category: 'admin tools',
   async: async (m, {
      client,
      text,
      command,
      participants,
      Utils
   }) => {
      try {
         let user = m.mentionedJid?.[0] || m.quoted?.sender

         const validate = Utils.validatePhone(text?.trim())
         if (text && validate.valid) {
            user = validate.jid_format
         }

         if (!user) return client.reply(m.chat, Utils.texted('bold', '🚩 Mention, reply, or enter a valid number target.'), m)

         if (!participants.some(v =>
            v.id == user || v.lid == user
         ) && ['kick'].includes(command)) return client.reply(m.chat, Utils.texted('bold', `🚩 Target already left or does not exist in this group.`), m)

         if (['kick', 'promote', 'demote'].includes(command)) {
            const [json] = await client.groupParticipantsUpdate(m.chat, [user], command === 'kick' ? 'remove' : command)
            if (json.status === '200') return m.reply(Utils.texted('bold', `✅ @${user?.replace(/@.+/, '')} was ${command === 'kick' ? 'removed' : `${command}d`}`))
            throw new Error('❌ Action failed')
         } else if (command === 'add') {
            // This command may lead to a high risk of your account being banned by WhatsApp.
            const [json] = await client.groupParticipantsUpdate(m.chat, [user], command)
            if (json.status === '200') return m.reply(Utils.texted('bold', `✅ Successfully added @${jid?.replace(/@.+/, '')} to the group.`))
            throw new Error('❌ Action failed')
         }
      } catch (e) {
         console.error(e)
         m.reply(Utils.texted('bold', `❌ ${e.message}`))
      }
   },
   group: true,
   admin: true,
   botAdmin: true
} 