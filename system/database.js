module.exports = (m) => {
   const isNumber = x => typeof x === 'number' && !isNaN(x)
   let user = global.db.users.find(v => v.jid == m.sender)
   if (user) {
  	if (!isNumber(user.afk)) user.afk = -1
      if (!('afkReason' in user)) user.afkReason = ''
      if (!isNumber(user.lastseen)) user.lastseen = 0
      if (!isNumber(user.spam)) user.spam = 0
   } else {
      global.db.users.push({
         jid: m.sender,
         afk: -1,
         afkReason: '',
         lastseen: 0,
         spam: 0
      })
   }

   if (m.isGroup) {
      let group = global.db.groups.find(v => v.jid == m.chat)
      if (group) {
         if (!('autoread' in group)) group.autoread = false
      } else {
         global.db.groups.push({
            jid: m.chat,
            autoread: false
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
      if (!('chatbot' in setting)) setting.chatbot = true
      if (!('debug' in setting)) setting.debug = false
      if (!('self' in setting)) setting.self = true
      if (!('multiprefix' in setting)) setting.multiprefix = true
      if (!('prefix' in setting)) setting.prefix = ['.', '/', '!', '#']
      if (!('whitelist' in setting)) setting.whitelist = []
      if (!('online' in setting)) setting.online = false
      if (!('onlyprefix' in setting)) setting.onlyprefix = '`'
      if (!('owners' in setting)) setting.owners = []
      if (!('viewstory' in setting)) setting.viewstory = false
      if (!('cover' in setting)) setting.cover = 'https://telegra.ph/file/da25bb27d4575704efd18.jpg'
   } else {
      global.db.setting = {
         chatbot: true,
         debug: false,
         self: true,
         multiprefix: true,
         prefix: ['.', '#', '!', '/'],
         whitelist: [],
         online: false,
         onlyprefix: '`',
         owners: [],
         viewstory: false,
         cover: 'https://telegra.ph/file/da25bb27d4575704efd18.jpg'
      }
   }
}