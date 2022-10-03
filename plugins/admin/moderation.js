exports.run = {
   usage: ['antidelete', 'antilink', 'antivirtex', 'left', 'filter', 'localonly', 'welcome'],
   use: 'on / off',
   category: 'admin tools',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      isBotAdmin
   }) => {
      let setting = global.db.groups[m.chat]
      let rows = [{
         title: Func.ucword(command),
         rowId: `${isPrefix + command} on`,
         description: `[ Status : ON ]`
      }, {
         title: Func.ucword(command),
         rowId: `${isPrefix + command} off`,
         description: `[ Status : OFF ]`
      }]
      let type = command.toLowerCase()
      if (!isBotAdmin && /antilink|antivirtex|filter|localonly/.test(type)) return client.reply(m.chat, global.status.botAdmin, m)
      if (!args || !args[0]) return client.sendList(m.chat, '', `🚩 *Current status* : [ ${setting[type] ? 'ON' : 'OFF'} ]`, '', 'Tap!', [{
         rows
      }], m)
      let option = args[0].toLowerCase()
      let optionList = ['on', 'off']
      if (!optionList.includes(option)) return client.sendList(m.chat, '', `🚩 *Current status* : [ ${setting[type] ? 'ON' : 'OFF'} ]`, '', 'Tap!', [{
         rows
      }], m)
      let status = option != 'on' ? false : true
      if (setting[type] == status) return client.reply(m.chat, Func.texted('bold', `🚩 ${Func.ucword(command)} has been ${option == 'on' ? 'activated' : 'inactivated'} previously.`), m)
      setting[type] = status
      client.reply(m.chat, Func.texted('bold', `🚩 ${Func.ucword(command)} has been ${option == 'on' ? 'activated' : 'inactivated'} successfully.`), m)
   },
   admin: true,
   group: true,
   cache: true,
   location: __filename
}