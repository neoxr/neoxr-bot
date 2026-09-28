export const run = {
   usage: ['antidelete', 'antilink', 'antivirtex', 'antitagsw', 'autosticker', 'viewonce', 'left', 'filter', 'localonly', 'welcome'],
   use: 'on / off',
   category: 'admin tools',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      isBotAdmin,
      Utils
   }) => {
      const [argumen] = args
      try {
         let setting = global.db.groups.find(v => v.jid == m.chat)
         let type = command.toLowerCase()
         if (!isBotAdmin && /antilink|antivirtex|filter|localonly|antitagsw/.test(type)) return client.reply(m.chat, global.status.botAdmin, m)
         if (!args || !argumen) return client.reply(m.chat, `❌ *Current status* : [ ${setting[type] ? 'ON' : 'OFF'} ] (Enter *On* or *Off*)`, m)
         let option = argumen.toLowerCase()
         let optionList = ['on', 'off']
         if (!optionList.includes(option)) return client.reply(m.chat, `❌ *Current status* : [ ${setting[type] ? 'ON' : 'OFF'} ] (Enter *On* or *Off*)`, m)
         let status = option != 'on' ? false : true
         if (setting[type] == status) return client.reply(m.chat, Utils.texted('bold', `✅ ${Utils.ucword(command)} has been ${option == 'on' ? 'activated' : 'inactivated'} previously.`), m)
         setting[type] = status
         client.reply(m.chat, Utils.texted('bold', `✅ ${Utils.ucword(command)} has been ${option == 'on' ? 'activated' : 'inactivated'} successfully.`), m)
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   admin: true,
   group: true
}