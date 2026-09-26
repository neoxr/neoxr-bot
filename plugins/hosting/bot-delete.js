export const run = {
   usage: ['deletebot'],
   hidden: ['delbot'],
   category: 'hosting',
   async: async (m, {
      client,
      connector,
      args,
      command,
      isPrefix,
      isOperator,
      isOwner
   }) => {
      try {
         const mainConnector = connector?.mainBotInstance || connector

         if (!mainConnector) {
            return client.reply(m.chat, 'Main connector is not available.', m)
         }

         const value = args[0]?.trim()
         if (!value) {
            return client.reply(m.chat, `Invalid format! Use:\n${isPrefix}${command} <id/@username>`, m)
         }

         const dbKey = mainConnector.options?.prefix_data || 'db'
         const rootDb = global[dbKey] || global.db || {}
         const botList = Array.isArray(rootDb.bots) ? rootDb.bots : []

         const cleanTarget = value.replace(/^@/, '').toLowerCase()
         const botIndex = botList.findIndex(b =>
            String(b.id).toLowerCase() === cleanTarget ||
            String(b.username || '').replace(/^@/, '').toLowerCase() === cleanTarget ||
            b.token === value
         )

         if (botIndex === -1) {
            return client.reply(m.chat, `Bot "${value}" was not found in the database.`, m)
         }

         const targetEntry = botList[botIndex]
         const senderId = String(m.sender.id)
         const hasFullAccess = isOperator || isOwner

         if (!hasFullAccess && String(targetEntry.owner) !== senderId) {
            return client.reply(m.chat, 'Access denied! You can only delete your own bot.', m)
         }

         const targetIdentifier = targetEntry.username || targetEntry.id
         client.reply(m.chat, `Stopping and permanently deleting bot @${targetIdentifier}...`, m)

         await mainConnector.stop(targetIdentifier).catch(() => { })

         for (const [k, bot] of mainConnector.activeChildBots.entries()) {
            const bId = String(bot.botInfo?.id || '').toLowerCase()
            const bUser = String(bot.botInfo?.username || '').toLowerCase().replace(/^@/, '')
            const clean = String(targetIdentifier).toLowerCase().replace(/^@/, '')
            if (String(k).toLowerCase() === clean || bId === clean || bUser === clean) {
               mainConnector.activeChildBots.delete(k)
            }
         }

         botList.splice(botIndex, 1)

         return client.reply(m.chat, `🗑️ Bot @${targetIdentifier} has been completely deleted.`, m)

      } catch (error) {
         return client.reply(m.chat, `An internal error occurred: ${error.message}`, m)
      }
   },
   error: false
}