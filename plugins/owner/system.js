neoxr.create(async (m, {
   client,
   args,
   prefix,
   command,
   Func
}) => {
   try {
      let system = global.db.setting
      let rows = [{
         title: Func.ucword(command),
         rowId: `${prefix + command} on`,
         description: `[ Status : ON ]`
      }, {
         title: Func.ucword(command),
         rowId: `${prefix + command} off`,
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
   } catch (e) {
      client.reply(m.chat, Func.jsonFormat(e), m)
   }
}, {
   usage: ['chatbot', 'noprefix', 'multiprefix', 'online', 'self', 'viewstory'],
   use: 'on / off',
   category: 'owner',
   owner: true
}, __filename)