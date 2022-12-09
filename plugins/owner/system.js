exports.run = {
   usage: ['autodownload', 'chatbot', 'debug', 'groupmode', 'multiprefix', 'online', 'self'],
   use: 'on / off',
   category: 'owner',
   async: async (m, {
      client,
      args,
      isPrefix,
      command
   }) => {
      let system = global.db.setting
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
      if (!args || !args[0]) return client.sendList(m.chat, '', `🚩 *Current status* : [ ${system[type] ? 'ON' : 'OFF'} ]`, '', 'Tap!', [{
         rows
      }], m)
      let option = args[0].toLowerCase()
      let optionList = ['on', 'off']
      if (!optionList.includes(option)) return client.sendList(m.chat, '', `🚩 *Current status* : [ ${system[type] ? 'ON' : 'OFF'} ]`, '', 'Tap!', [{
         rows
      }], m)
      let status = option != 'on' ? false : true
      if (system[type] == status) return client.reply(m.chat, Func.texted('bold', `🚩 ${Func.ucword(command)} has been ${option == 'on' ? 'activated' : 'inactivated'} previously.`), m)
      system[type] = status
      client.reply(m.chat, Func.texted('bold', `🚩 ${Func.ucword(command)} has been ${option == 'on' ? 'activated' : 'inactivated'} successfully.`), m)
   },
   owner: true,
   cache: true,
   location: __filename
}