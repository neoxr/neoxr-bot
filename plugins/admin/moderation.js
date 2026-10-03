export const run = {
   usage: ['actinfo', 'antidelete', 'antilink', 'antivirtex', 'antitagsw', 'autosticker', 'left', 'norejoin', 'filter', 'welcome'],
   use: 'on / off',
   category: 'admin tools',
   async: async (m, {
      client,
      args,
      command,
      isBotAdmin,
      groupSet,
      Utils
   }) => {
      try {
         const type = command.toLowerCase()
         if (!isBotAdmin && /antilink|antivirtex|filter|antitagsw|norejoin/.test(type)) {
            return client.reply(m.chat, global.status.botAdmin, m)
         }

         const [opt] = args || []
         const option = opt?.toLowerCase()

         if (!option || !['on', 'off'].includes(option)) {
            return client.reply(m.chat, `❌ *Current status* : [ ${groupSet[type] ? 'ON' : 'OFF'} ] (Enter *On* or *Off*)`, m)
         }

         const status = option === 'on'
         const stateText = status ? 'activated' : 'inactivated'

         if (groupSet[type] === status) {
            return client.reply(m.chat, Utils.texted('bold', `❌ ${Utils.ucword(command)} has been ${stateText} previously.`), m)
         }

         groupSet[type] = status
         client.reply(m.chat, Utils.texted('bold', `✅ ${Utils.ucword(command)} has been ${stateText} successfully.`), m)
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   admin: true,
   group: true
}
