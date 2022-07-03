exports.run = {
   usage: ['autoread', 'oleft', 'owelcome'],
   async: async (m, {
      client,
      args,
      isPrefix,
      command
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
      let check = command.toLowerCase()
      let type = check.startsWith('o') ? check.substring(1) : check
      if (!args || !args[0]) return client.sendList(m.chat, '', `🚩 Status saat ini : [ ${setting[type] ? 'ON' : 'OFF'} ]`, '', 'Tap!', [{ rows }], m)
      let option = args[0].toLowerCase()
      let optionList = ['on', 'off']
      if (!optionList.includes(option)) return client.sendList(m.chat, '', `🚩 Status saat ini : [ ${setting[type] ? 'ON' : 'OFF'} ]`, '', 'Tap!', [{ rows }], m)
      let status = option != 'on' ? false : true
      if (setting[type] == status) return client.reply(m.chat, Func.texted('bold', `🚩 ${Func.ucword(type)} sebelumnya sudah ${option == 'on' ? 'diaktifkan' : 'dimatikan'}.`), m)
      setting[type] = status
      client.reply(m.chat, Func.texted('bold', `🚩 ${Func.ucword(type)} berhasil ${option == 'on' ? 'diaktifkan' : 'dimatikan'}.`), m)
   },
   group: true,
   owner: true,
   cache: true,
   location: __filename
}