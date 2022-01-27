exports.run = {
   usage: ['autodownload', 'games', 'groupmode', 'multiprefix', 'self'],
   async: async (m, {
      client,
      args,
      command,
      isGod
   }) => {
      let system = global.setting
      if (!args || !args[0]) return client.reply(m.chat, Func.texted('bold', `Select option on / off.`), m)
      let type = command.toLowerCase()
      let option = args[0].toLowerCase()
      let optionList = ['on', 'off']
      if (!optionList.includes(option)) return client.reply(m.chat, Func.texted('bold', `Select option on / off.`), m)
      let status = option != 'on' ? false : true
      if (type == 'autodownload') {
         if (system.autodownload == status) return client.reply(m.chat, Func.texted('bold', `Auto Download already ${args[0].toUpperCase()}.`), m)
         system.autodownload = status
         return client.reply(m.chat, Func.texted('bold', `Auto Download successfully turned ${args[0].toUpperCase()}.`), m)
      } else if (type == 'games') {
         if (system.games == status) return client.reply(m.chat, Func.texted('bold', `Games Features already ${args[0].toUpperCase()}.`), m)
         system.games = status
         return client.reply(m.chat, Func.texted('bold', `Games Features successfully turned ${args[0].toUpperCase()}.`), m)
      } else if (type == 'groupmode') {
         if (system.groupmode == status) return client.reply(m.chat, Func.texted('bold', `Group Mode already ${args[0].toUpperCase()}.`), m)
         system.groupmode = status
         return client.reply(m.chat, Func.texted('bold', `Group Mode successfully turned ${args[0].toUpperCase()}.`), m)
      } else if (type == 'multiprefix') {
         if (system.multiprefix == status) return client.reply(m.chat, Func.texted('bold', `Multi Prefix already ${args[0].toUpperCase()}.`), m)
         system.multiprefix = status
         delete global.myPrefix
         return client.reply(m.chat, Func.texted('bold', `Multi Prefix successfully turned ${args[0].toUpperCase()}.`), m)
      } else if (type == 'self') {
         if (system.self == status) return client.reply(m.chat, Func.texted('bold', `Self Mode already ${args[0].toUpperCase()}.`), m)
         system.self = status
         return client.reply(m.chat, Func.texted('bold', `Self Mode successfully turned ${args[0].toUpperCase()}.`), m)
      }
   },
   owner: true,
   cache: true,
   location: __filename
}