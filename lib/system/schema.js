module.exports = (m, env) => {
   const isNumber = x => typeof x === 'number' && !isNaN(x)
   let user = global.db.users.find(v => v.jid == m.sender)
   if (user) {
      if (!isNumber(user.afk)) user.afk = -1
      if (!('afkReason' in user)) user.afkReason = ''
      if (!('afkObj' in user)) user.afkObj = {}
      if (!('name' in user)) user.name= m.pushName
      if (!('banned' in user)) user.banned = false
      if (!isNumber(user.ban_temporary)) user.ban_temporary = 0
      if (!isNumber(user.ban_times)) user.ban_times = 0
      if (!isNumber(user.limit)) user.limit = env.limit
      if (!('premium' in user)) user.premium = false
      if (!isNumber(user.expired)) user.expired = 0
      if (!isNumber(user.lastseen)) user.lastseen = 0
      if (!isNumber(user.hit)) user.hit = 0
      if (!isNumber(user.warning)) user.warning = 0
      if (!('email' in user)) user.email = ''
      if (!('verified' in user)) user.verified = false
   } else {
      global.db.users.push({
         jid: m.sender,
     	   afk: -1,
         afkReason: '',
         afkObj: {},
         name: m.pushName,
         banned: false,
         ban_temporary: 0,
         ban_times: 0,
         limit: env.limit,
         premium: false,
         expired: 0,
         lastseen: 0,
         hit: 0,
         warning: 0,
         email: '',
         verified: false,
      })
   }

   if (m.isGroup) {
      let group = global.db.groups.find(v => v.jid == m.chat)
      if (group) {
         if (!isNumber(group.activity)) group.activity = 0
         if (!('antidelete' in group)) group.antidelete = false
         if (!('antilink' in group)) group.antilink = true
         if (!('antivirtex' in group)) group.antivirtex = true
         if (!('filter' in group)) group.filter = false
         if (!('left' in group)) group.left = false
         if (!('localonly' in group)) group.localonly = false
         if (!('mute' in group)) group.mute = false
         if (!('viewonce' in group)) group.viewonce = false
         if (!('autosticker' in group)) group.autosticker = false
         if (!('member' in group)) group.member = {}
         if (!('text_left' in group)) group.text_left = ''
         if (!('text_welcome' in group)) group.text_welcome = ''
         if (!('welcome' in group)) group.welcome = false
         if (!isNumber(group.expired)) group.expired = 0
         if (!('stay' in group)) group.stay = false
      } else {
         global.db.groups.push({
            jid: m.chat,
            activity: 0,
            antidelete: true,
            antilink: false,
            antivirtex: false,
            filter: false,
            left: false,
            localonly: false,
            mute: false,
            viewonce: true,
            autosticker: true,
            member: {},
            text_left: '',
            text_welcome: '',
            welcome: true,
            expired: 0,
            stay: false
         })
      }
   }



  
   let chat = global.db.chats.find(v => v.jid == m.chat)
   if (chat) {
      if (!isNumber(chat.chat)) chat.chat = 0
      if (!isNumber(chat.lastchat)) chat.lastchat = 0
      if (!isNumber(chat.lastseen)) chat.lastseen = 0
   } else {
      global.db.chats.push({
         jid: m.chat,
         chat: 0,
         lastchat: 0,
         lastseen: 0
      })
   }

   let setting = global.db.setting
   if (setting) {
      if (!('autodownload' in setting)) setting.autodownload = true
      if (!('antispam' in setting)) setting.antispam = false
      if (!('chatbot' in setting)) setting.chatbot = false
   	if (!('debug' in setting)) setting.debug = false
      if (!('error' in setting)) setting.error = []
      if (!('hidden' in setting)) setting.hidden = []
      if (!('pluginDisable' in setting)) setting.pluginDisable = []
      if (!('receiver' in setting)) setting.receiver = []
      if (!('groupmode' in setting)) setting.groupmode = false
      if (!('sk_pack' in setting)) setting.sk_pack = 'Ibrahim'
      if (!('sk_author' in setting)) setting.sk_author = '© Lucifer-md'
      if (!('self' in setting)) setting.self = false
      if (!('noprefix' in setting)) setting.noprefix = false
      if (!('multiprefix' in setting)) setting.multiprefix = true
      if (!('prefix' in setting)) setting.prefix = ['/']
      if (!('toxic' in setting)) setting.toxic = ["aassw"]
      if (!('online' in setting)) setting.online = true
      if (!('onlyprefix' in setting)) setting.onlyprefix = '+'
      if (!('owners' in setting)) setting.owners = ['923229931076']
      if (!isNumber(setting.lastReset)) setting.lastReset = new Date * 1
      if (!('msg' in setting)) setting.msg = 'Hi +tag 🪸\nI am an automated system (WhatsApp Bot) that can help to do something, search and get data / information only through WhatsApp.\n\n◦ *Database* : +db\n◦ *Library* : Baileys v+version\n◦ *Website* : https://lucifercloud.me\n\nIf you find an error or want to upgrade premium plan contact the owner.'
      if (!isNumber(setting.style)) setting.style = 4
      if (!('cover' in setting)) setting.cover = 'https://i.pinimg.com/564x/10/02/e7/1002e7219ab71b6b257bc15ca3229ec8.jpg'
      if (!('link' in setting)) setting.link = ''
      if (!('verify' in setting)) setting.verify = false
   } else {
      global.db.setting = {
         autodownload: true,
         antispam: true,
         debug: false,
         error: [],
         hidden: [],
         pluginDisable: [],
         groupmode: false,
         sk_pack: 'Ibrahim',
         sk_author: '© Lucifer-md',
         self: false,
         noprefix: false,
         multiprefix: true,
         receiver: [],
         prefix: ['/'],
         toxic: ["aassw"],
         online: true,
         verify: false,
         onlyprefix: '+',
         owners: ['923229931076'],
         lastReset: new Date * 1,
         msg: 'Hi +tag 🪸\nI am an automated system (WhatsApp Bot) that can help to do something, search and get data / information only through WhatsApp.\n\n◦ *Database* : +db\n◦ *Library* : Baileys v+version\n◦ *Website* : https://lucifercloud.me\n\nIf you find an error or want to upgrade premium plan contact the owner.',
         style: 4,
         cover: 'https://i.pinimg.com/564x/10/02/e7/1002e7219ab71b6b257bc15ca3229ec8.jpg',
         link: ''
      }
   }
}
