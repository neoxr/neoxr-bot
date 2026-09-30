export const run = {
   usage: ['autobackup', 'autodownload', 'antispam', 'debug', 'groupmode', 'multiprefix', 'noprefix', 'online', 'self', 'notifier'],
   use: 'on / off',
   category: 'owner',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      Utils,
      setting: system
   }) => {
      try {
         let type = command.toLowerCase()
         if (!args || !args[0]) return client.reply(m.chat, `❌ *Current status* : [ ${system[type] ? 'ON' : 'OFF'} ] (Enter *On* or *Off*)`, m)
         let option = args[0].toLowerCase()
         let optionList = ['on', 'off']
         if (!optionList.includes(option)) return client.reply(m.chat, `❌ *Current status* : [ ${system[type] ? 'ON' : 'OFF'} ] (Enter *On* or *Off*)`, m)
         let status = option != 'on' ? false : true
         if (system[type] == status) return client.reply(m.chat, Utils.texted('bold', `✅ ${Utils.ucword(command)} has been ${option == 'on' ? 'activated' : 'inactivated'} previously.`), m)
         system[type] = status
         client.reply(m.chat, Utils.texted('bold', `✅ ${Utils.ucword(command)} has been ${option == 'on' ? 'activated' : 'inactivated'} successfully.`), m)
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   owner: true
}