export const run = {
   usage: ['startbot', 'stopbot', 'restartbot'],
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
         const targetEntry = botList.find(b =>
            String(b.id).toLowerCase() === cleanTarget ||
            String(b.username || '').replace(/^@/, '').toLowerCase() === cleanTarget ||
            b.token === value
         )

         if (!targetEntry) {
            return client.reply(m.chat, `Bot "${value}" was not found in the database.`, m)
         }

         const senderId = String(m.sender.id)
         const hasFullAccess = isOperator || isOwner
         const isAuthorized = hasFullAccess || String(targetEntry.owner) === senderId

         if (!isAuthorized) {
            return client.reply(m.chat, 'Access denied! You are not the owner of this subbot.', m)
         }

         const targetIdentifier = targetEntry.username || targetEntry.id

         const checkIsRunning = () => {
            if (targetEntry.stop) return false
            const activeBots = [...mainConnector.activeChildBots.values()]
            const activeKeys = [...mainConnector.activeChildBots.keys()].map(v => String(v).toLowerCase().replace(/^@/, ''))
            const targetId = String(targetEntry.id || '').toLowerCase()
            const targetUser = String(targetEntry.username || '').toLowerCase().replace(/^@/, '')

            const inMap = activeKeys.includes(targetId) || activeKeys.includes(targetUser)
            const inInstances = activeBots.some(bot => {
               const bId = String(bot.botInfo?.id || '').toLowerCase()
               const bUser = String(bot.botInfo?.username || '').toLowerCase().replace(/^@/, '')
               return bId === targetId || bUser === targetUser || (targetEntry.token && bot.options?.create?.token === targetEntry.token)
            })

            return inMap || inInstances || Boolean(targetEntry.is_connected)
         }

         if (command === 'startbot') {
            if (checkIsRunning()) {
               return client.reply(m.chat, `Bot @${targetIdentifier} is already active.`, m)
            }

            const success = await mainConnector.start(targetIdentifier)
            if (success) {
               targetEntry.stop = false
               targetEntry.is_connected = true
            }
            return client.reply(m.chat, success
               ? `✅ Successfully started bot @${targetIdentifier}.`
               : `❌ Failed to start bot @${targetIdentifier}. Please check token status.`, m)
         }

         if (command === 'stopbot') {
            const success = await mainConnector.stop(targetIdentifier)
            targetEntry.stop = true
            targetEntry.is_connected = false

            for (const [k, bot] of mainConnector.activeChildBots.entries()) {
               const bId = String(bot.botInfo?.id || '').toLowerCase()
               const bUser = String(bot.botInfo?.username || '').toLowerCase().replace(/^@/, '')
               const clean = String(targetIdentifier).toLowerCase().replace(/^@/, '')
               if (String(k).toLowerCase() === clean || bId === clean || bUser === clean) {
                  mainConnector.activeChildBots.delete(k)
               }
            }

            return client.reply(m.chat, success
               ? `🛑 Successfully stopped bot @${targetIdentifier}.`
               : `❌ Failed to stop bot @${targetIdentifier}.`, m)
         }

         if (command === 'restartbot') {
            client.reply(m.chat, `Restarting bot @${targetIdentifier}...`, m)
            const success = await mainConnector.restart(targetIdentifier)
            if (success) {
               targetEntry.stop = false
               targetEntry.is_connected = true
            }
            return client.reply(m.chat, success
               ? `🔄 Successfully restarted bot @${targetIdentifier}.`
               : `❌ Failed to restart bot @${targetIdentifier}.`, m)
         }

      } catch (error) {
         return client.reply(m.chat, `An internal error occurred: ${error.message}`, m)
      }
   },
   error: false,
   limit: true
}