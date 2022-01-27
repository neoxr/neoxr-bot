exports.run = {
   usage: ['ogame', 'onotify', 'owelcome', 'oleft'],
   async: async (m, {
      client,
      args,
      command,
      isBotAdmin
   }) => {
      let setting = global.groups[m.chat]
      if (!args || !args[0]) return client.reply(m.chat, Func.texted('bold', `Select option on / off.`), m)
      let type = command.toLowerCase()
      let option = args[0].toLowerCase()
      let optionList = ['on', 'off']
      if (!optionList.includes(option)) return client.reply(m.chat, Func.texted('bold', `Select option on / off.`), m)
      let status = option != 'on' ? false : true
      if (type == 'ogame') {
         if (setting.game == status) return client.reply(m.chat, Func.texted('bold', `Game Features already ${args[0].toUpperCase()}.`), m)
         setting.game = status
         return client.reply(m.chat, Func.texted('bold', `Game Features successfully turned ${args[0].toUpperCase()}.`), m)
      } else if (type == 'oleft') {
         if (setting.left == status) return client.reply(m.chat, Func.texted('bold', `Left Message already ${args[0].toUpperCase()}.`), m)
         setting.left = status
         return client.reply(m.chat, Func.texted('bold', `Left Message successfully turned ${args[0].toUpperCase()}.`), m)
      } else if (type == 'onotify') {
         if (setting.notify == status) return client.reply(m.chat, Func.texted('bold', `Spam Notification already ${args[0].toUpperCase()}.`), m)
         setting.notify = status
         return client.reply(m.chat, Func.texted('bold', `Spam Notification successfully turned ${args[0].toUpperCase()}.`), m)
      } else if (type == 'owelcome') {
         if (setting.welcome == status) return client.reply(m.chat, Func.texted('bold', `Welcome Message already ${args[0].toUpperCase()}.`), m)
         setting.welcome = status
         return client.reply(m.chat, Func.texted('bold', `Welcome Message successfully turned ${args[0].toUpperCase()}.`), m)
      }
   },
   owner: true,
   group: true,
   cache: true,
   location: __filename
}