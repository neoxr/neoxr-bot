exports.run = {
   usage: ['autodownload', 'debug', 'groupmode', 'multiprefix', 'noprefix', 'online', 'self'],
   use: 'on / off',
   category: 'owner',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      Func
   }) => {
      let system = global.db.setting
      let type = command.toLowerCase()
      if (!args || !args[0]) return client.reply(m.chat, `🚩 *Current status* : [ ${system[type] ? 'ON' : 'OFF'} ] (Enter *On* or *Off*)`, m)
      let option = args[0].toLowerCase()
      let optionList = ['on', 'off']
      if (!optionList.includes(option)) return client.reply(m.chat, `🚩 *Current status* : [ ${system[type] ? 'ON' : 'OFF'} ] (Enter *On* or *Off*)`, m)
      let status = option != 'on' ? false : true
      if (system[type] == status) return client.reply(m.chat, Func.texted('bold', `🚩 ${Func.ucword(command)} has been ${option == 'on' ? 'activated' : 'inactivated'} previously.`), m)
      system[type] = status
      client.reply(m.chat, Func.texted('bold', `🚩 ${Func.ucword(command)} has been ${option == 'on' ? 'activated' : 'inactivated'} successfully.`), m)
   },
   owner: true,
   cache: true,
   location: __filename
}