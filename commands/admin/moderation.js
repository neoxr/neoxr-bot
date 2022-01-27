exports.run = {
   usage: ['antilink', 'antivirtex', 'left', 'filter', 'game', 'localonly', 'notify', 'protect', 'welcome'],
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
      if (type == 'antidelete' || type == 'antidel') {
         if (setting.nodelete == status) return client.reply(m.chat, Func.texted('bold', `Anti Delete already ${args[0].toUpperCase()}.`), m)
         setting.nodelete = status
         return client.reply(m.chat, Func.texted('bold', `Anti Delete successfully turned ${args[0].toUpperCase()}.`), m)
      } else if (type == 'antilink') {
         if (!isBotAdmin) return client.reply(m.chat, global.status.botAdmin, m)
         if (setting.nolink == status) return client.reply(m.chat, Func.texted('bold', `Anti Group Link already ${args[0].toUpperCase()}.`), m)
         setting.nolink = status
         return client.reply(m.chat, Func.texted('bold', `Auto Group Link successfully turned ${args[0].toUpperCase()}.`), m)
      } else if (type == 'antivirtex') {
         if (!isBotAdmin) return client.reply(m.chat, global.status.botAdmin, m)
         if (setting.novirtex == status) return client.reply(m.chat, Func.texted('bold', `Anti Virtex already ${args[0].toUpperCase()}.`), m)
         setting.novirtex = status
         return client.reply(m.chat, Func.texted('bold', `Auto Virtex successfully turned ${args[0].toUpperCase()}.`), m)
      } else if (type == 'filter') {
         if (!isBotAdmin) return client.reply(m.chat, global.status.botAdmin, m)
         if (setting.nobadword == status) return client.reply(m.chat, Func.texted('bold', `Filter already ${args[0].toUpperCase()}.`), m)
         setting.nobadword = status
         return client.reply(m.chat, Func.texted('bold', `Filter successfully turned ${args[0].toUpperCase()}.`), m)
      } else if (type == 'game') {
         if (setting.game == status) return client.reply(m.chat, Func.texted('bold', `Game Features already ${args[0].toUpperCase()}.`), m)
         setting.game = status
         return client.reply(m.chat, Func.texted('bold', `Game Features successfully turned ${args[0].toUpperCase()}.`), m)
      } else if (type == 'localonly') {
         if (!isBotAdmin) return client.reply(m.chat, global.status.botAdmin, m)
         if (setting.localonly == status) return client.reply(m.chat, Func.texted('bold', `Localonly already ${args[0].toUpperCase()}.`), m)
         setting.localonly = status
         return client.reply(m.chat, Func.texted('bold', `Localonly successfully turned ${args[0].toUpperCase()}.`), m)
      } else if (type == 'left') {
         if (setting.left == status) return client.reply(m.chat, Func.texted('bold', `Left Message already ${args[0].toUpperCase()}.`), m)
         setting.left = status
         return client.reply(m.chat, Func.texted('bold', `Left Message successfully turned ${args[0].toUpperCase()}.`), m)
      } else if (type == 'notify') {
         if (setting.notify == status) return client.reply(m.chat, Func.texted('bold', `Spam Notification already ${args[0].toUpperCase()}.`), m)
         setting.notify = status
         return client.reply(m.chat, Func.texted('bold', `Spam Notification successfully turned ${args[0].toUpperCase()}.`), m)
      } else if (type == 'protect') {
         if (!isBotAdmin) return client.reply(m.chat, global.status.botAdmin, m)
         if (setting.spamProtect == status) return client.reply(m.chat, Func.texted('bold', `Spam Protection already ${args[0].toUpperCase()}.`), m)
         setting.spamProtect = status
         return client.reply(m.chat, Func.texted('bold', `Spam Protection successfully turned ${args[0].toUpperCase()}.`), m)
      } else if (type == 'welcome') {
         if (setting.welcome == status) return client.reply(m.chat, Func.texted('bold', `Welcome Message already ${args[0].toUpperCase()}.`), m)
         setting.welcome = status
         return client.reply(m.chat, Func.texted('bold', `Welcome Message successfully turned ${args[0].toUpperCase()}.`), m)
      }
   },
   admin: true,
   group: true,
   cache: true,
   location: __filename
}