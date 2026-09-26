export const run = {
   usage: ['childbot', 'listbot', 'createbot'],
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

         if (!mainConnector.options?.multiple) {
            return client.reply(m.chat, 'Multi-bot feature is disabled in the main bot configuration.', m)
         }

         const dbKey = mainConnector.options?.prefix_data || 'db'
         const rootDb = global[dbKey] || global.db || {}
         const botList = Array.isArray(rootDb.bots) ? rootDb.bots : []
         const senderId = String(m.sender.id)
         const hasFullAccess = isOperator || isOwner

         if (command === 'childbot') {
            const text = [
               'Child Bot Manager\n',
               `• <code>${isPrefix}listbot</code>`,
               `• <code>${isPrefix}createbot &lt;token&gt;</code>`,
               `• <code>${isPrefix}startbot &lt;id/@username&gt;</code>`,
               `• <code>${isPrefix}stopbot &lt;id/@username&gt;</code>`,
               `• <code>${isPrefix}restartbot &lt;id/@username&gt;</code>`,
               `• <code>${isPrefix}deletebot &lt;id/@username&gt;</code>\n`,
               '<blockquote>Warning: For security reasons, the createbot command must only be executed in a private chat.</blockquote>'
            ].join('\n')

            return client.reply(m.chat, text, m, { parse_mode: 'HTML' })
         }

         if (command === 'listbot') {
            const visibleBots = hasFullAccess
               ? botList
               : botList.filter(b => String(b.owner) === senderId)

            const activeBots = [...mainConnector.activeChildBots.values()]
            const activeKeys = [...mainConnector.activeChildBots.keys()].map(v => String(v).toLowerCase().replace(/^@/, ''))

            const listText = visibleBots.length > 0
               ? visibleBots.map((b, i) => {
                  const idStr = String(b.id || '').toLowerCase().replace(/^@/, '')
                  const userStr = String(b.username || '').toLowerCase().replace(/^@/, '')

                  const isInstanceActive = activeBots.some(bot => {
                     const bId = String(bot.botInfo?.id || '').toLowerCase()
                     const bUser = String(bot.botInfo?.username || '').toLowerCase().replace(/^@/, '')
                     const bIdent = String(bot.getBotIdentifier?.() || '').toLowerCase().replace(/^@/, '')
                     return (
                        (bId && (bId === idStr || bId === userStr)) ||
                        (bUser && (bUser === userStr || bUser === idStr)) ||
                        (bIdent && (bIdent === userStr || bIdent === idStr)) ||
                        (b.token && bot.options?.create?.token === b.token)
                     )
                  })

                  const isKeyActive = activeKeys.includes(idStr) || activeKeys.includes(userStr)
                  const isActive = !b.stop && (isInstanceActive || isKeyActive || b.is_connected)
                  const status = b.stop ? '🔴 Stopped' : (isActive ? '🟢 Active' : '🟡 Offline')

                  return `${i + 1}. @${b.username || b.id} [${status}]`
               }).join('\n')
               : 'No bots registered yet.'

            return client.reply(m.chat, `Registered Child Bots:\n\n${listText}`, m)
         }

         if (command === 'createbot') {
            if (connector.isChildInstance) {
               const mainBotTag = connector.mainBotInstance?.botInfo?.username
                  ? ` (@${connector.mainBotInstance.botInfo.username})`
                  : ''
               return client.reply(m.chat, `This command can only be executed on the main bot${mainBotTag}.`, m)
            }

            if (m.isGroup) {
               m.delete().catch(() => { })
               return client.reply(m.chat, 'For your token security, bot creation is only permitted in Private Chat!', m)
            }

            const value = args[0]?.trim()
            if (!value) {
               return client.reply(m.chat, `Invalid format! Use:\n${isPrefix}${command} <token>`, m)
            }

            const tokenRegex = /^\d{8,12}:[a-zA-Z0-9_-]{35,}$/
            if (!tokenRegex.test(value)) {
               return client.reply(m.chat, 'Invalid BOT TOKEN format! Please ensure you get the token directly from @BotFather.', m)
            }

            const isTokenUsed = botList.some(b => b.token === value || b.connector?.token === value)
            if (isTokenUsed) {
               return client.reply(m.chat, 'A bot with this token is already registered in the database.', m)
            }

            client.reply(m.chat, 'Verifying and connecting bot to Telegram API...', m)

            const child = await mainConnector.create({
               create: { token: value },
               owner: senderId
            })

            if (!child) {
               return client.reply(m.chat, 'Failed to create child bot! Please check your token validity and network connection.', m)
            }

            const identifier = child.getBotIdentifier()
            return client.reply(m.chat, `✅ Successfully created and activated child bot: @${identifier}\nYou are registered as the owner of this bot.`, m)
         }

      } catch (error) {
         return client.reply(m.chat, `An internal error occurred: ${error.message}`, m)
      }
   },
   error: false,
   limit: true
}