module.exports = (m) => {
   const isNumber = x => typeof x === 'number' && !isNaN(x)
   let user = global.db.users.find(v => v.jid == m.sender)
   if (user) {
      if (!isNumber(user.lastseen)) user.lastseen = 0
      if (!isNumber(user.spam)) user.spam = 0
   } else {
      global.db.users.push({
         jid: m.sender,
         lastseen: 0,
         spam: 0
      })
   }

   if (m.isGroup) {
      let group = global.db.groups.find(v => v.jid == m.chat)
      if (group) {
         if (!isNumber(group.activity)) group.activity = new Date * 1
      } else {
         global.db.groups.push({
            jid: m.chat,
            activity: new Date * 1
         })
      }
   }

   let chat = global.db.chats.find(v => v.jid == m.chat)
   if (chat) {
      if (!isNumber(chat.chat)) chat.chat = 0
      if (!isNumber(chat.lastchat)) chat.lastchat = 0
      if (!isNumber(chat.command)) chat.command = 0
   } else {
      global.db.chats.push({
         jid: m.chat,
         chat: 0,
         lastchat: 0,
         command: 0
      })
   }

   let setting = global.db.setting
   if (setting) {
      if (!('debug' in setting)) setting.debug = false
      if (!('self' in setting)) setting.self = true
      if (!('multiprefix' in setting)) setting.multiprefix = true
      if (!('prefix' in setting)) setting.prefix = ['.', '/', '!', '#']
      if (!('noprefix' in setting)) setting.noprefix = true
      if (!('whitelist' in setting)) setting.whitelist = []
      if (!('online' in setting)) setting.online = false
      if (!('onlyprefix' in setting)) setting.onlyprefix = '`'
      if (!('owners' in setting)) setting.owners = []
      if (!('receiver' in setting)) setting.receiver = []
      if (!('viewstory' in setting)) setting.viewstory = true
      if (!('cover' in setting)) setting.cover = 'https://telegra.ph/file/29184b05eb01b67e97585.jpg'
   } else {
      global.db.setting = {
         debug: false,
         self: true,
         multiprefix: true,
         prefix: ['.', '#', '!', '/'],
         noprefix: false,
         whitelist: [],
         online: false,
         onlyprefix: '`',
         owners: [],
         receiver: [],
         viewstory: false,
         cover: 'https://telegra.ph/file/29184b05eb01b67e97585.jpg'
      }
   }
}
