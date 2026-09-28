export const run = {
   usage: ['autobackup', 'autodownload', 'antispam', 'debug', 'groupmode', 'multiprefix', 'noprefix', 'online', 'self', 'notifier'],
   use: 'on / off',
   category: 'owner',
   async: async (m, {
      client,
      args,
      command,
      setting,
      Utils
   }) => {
      try {
         const type = command.toLowerCase()
         const [opt] = args || []
         const option = opt?.toLowerCase()

         if (!option || !['on', 'off'].includes(option)) {
            return client.reply(m.chat, `❌ *Current status* : [ ${setting[type] ? 'ON' : 'OFF'} ] (Enter *On* or *Off*)`, m)
         }

         const status = option === 'on'
         const stateText = status ? 'activated' : 'inactivated'

         if (setting[type] === status) {
            return client.reply(m.chat, Utils.texted('bold', `❌ ${Utils.ucword(command)} has been ${stateText} previously.`), m)
         }

         setting[type] = status
         client.reply(m.chat, Utils.texted('bold', `✅ ${Utils.ucword(command)} has been ${stateText} successfully.`), m)
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   owner: true
}
