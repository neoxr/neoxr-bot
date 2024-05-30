module.exports = (m, env) => {
   const isNumber = x => typeof x === 'number' && !isNaN(x)
   let user = global.db.users.find(v => v.jid == m.sender)
   if (user) {
      if (!('afkownObj' in user)) user.afkownObj = {}

      if (!isNumber(user.afkown)) user.afkown = -1
if (!('username' in user)) user.username = ''
      if (!('afkownReason' in user)) user.afkReason = ''
      if (!isNumber(user.afk)) user.afk = -1
      if (!isNumber(user.nama)) user.nama = 0
      if (!('afkReason' in user)) user.afkReason = ''
      if (!('afkObj' in user)) user.afkObj = {}
      if (!('name' in user)) user.name= m.pushName
      if (!('banned' in user)) user.banned = false
       if (!('VIP' in user)) user.VIP = false
if (!('helper' in user)) user.helper = false
if (!('girls' in user)) user.girls = false
if (!('member' in user)) user.member = false
if (!('moderator' in user)) user.moderator = false
if (!('veteran' in user)) user.veteran = false
if (!('active' in user)) user.active = false
if (!('pintar' in user)) user.pintar = false
if (!('hellboy' in user)) user.hellboy = false
if (!('fuckboy' in user)) user.fuckboy = false
if (!('bocil' in user)) user.bocil = false
if (!('rusuh' in user)) user.rusuh = false
if (!('solution' in user)) user.solution = false
if (!('gay' in user)) user.gay = false
if (!('ace' in user)) user.ace = false
if (!('bots' in user)) user.bots = false
if (!('administrator' in user)) user.administrator = false
if (!('bully' in user)) user.bully = false
if (!('andalanOwner' in user)) user.andalanOwner = false
      if (!isNumber(user.ban_temporary)) user.ban_temporary = 0
      if (!isNumber(user.ban_times)) user.ban_times = 0
      if (!isNumber(user.limit)) user.limit = env.limit
      if (!('chil' in user)) user.chil = false
      if (!('premium' in user)) user.premium = false
      if (!isNumber(user.expired)) user.expired = 0
      if (!isNumber(user.lastseen)) user.lastseen = 0
      if (!isNumber(user.hit)) user.hit = 0
       if (!isNumber(user.panen)) user.panen = 0
       if (!isNumber(user.bibit)) user.bibit = 0
      if (!isNumber(user.spine)) user.spine = 0
      if (!isNumber(user.leser)) user.leset = 0

if (!isNumber(user.rompi)) user.rompi = 0

if (!isNumber(user.sabit)) user.sabit = 0

if (!isNumber(user.traktor)) user.traktor = 0

if (!isNumber(user.payung)) user.payung = 0

if (!isNumber(user.palu)) user.palu = 0

if (!isNumber(user.cangkul)) user.cangkul = 0

if (!isNumber(user.sarung)) user.sarung = 0

if (!isNumber(user.sapi)) user.sapi = 0

if (!isNumber(user.ayam)) user.ayam = 0

if (!isNumber(user.naga)) user.naga = 0

if (!isNumber(user.serigala)) user.serigala = 0

if (!isNumber(user.landak)) user.landak = 0

if (!isNumber(user.kura)) user.kura = 0

if (!isNumber(user.kelinci)) user.kelinci = 0 

if (!isNumber(user.flaming)) user.flaming = 0

if (!isNumber(user.singa)) user.singa = 0

if (!isNumber(user.kanguru)) user.kanguru = 0 

if (!isNumber(user.ikan)) user.ikan = 0 

if (!isNumber(user.anjing)) user.anjing = 0 

if (!isNumber(user.bebek)) user.bebek = 0 

if (!isNumber(user.buaya)) user.buaya = 0 

if (!isNumber(user.uta)) user.lumba = 0
      if (!isNumber(user.warning)) user.warning = 0
      if (!isNumber(user.guard)) user.guard = 0
      if (!isNumber(user.point)) user.point = 0
      if (!isNumber(user.own)) user.own = 0
      if (!('bio' in user)) user.bio = ''
      if (!isNumber(user.lastseen)) user.lastseen = 0
      if (!isNumber(user.lastclaim)) user.lastclaim = 0
      if (!isNumber(user.lastburu)) user.lastburu = 0
      if (!isNumber(user.lastrob)) user.lastrob = 0
      if (!isNumber(user.lastspin)) user.lastspin = 0
      if (!('code' in user)) user.code = ''
      if (!isNumber(user.codeExpire)) user.codeExpire = 0
      if (!isNumber(user.attempt)) user.attempt = 0
      if (!('email' in user)) user.email = ''
      if (!('verified' in user)) user.verified = false
      if (!('partner' in user)) user.partner = ''
      if (!('authentication' in user)) user.authentication = false
      if (!isNumber(user.tabungan)) user.tabungan = 0
      if (!isNumber(user.saving)) user.saving = 0
      if (!('transfer_history' in user)) user.transfer_history = []
      if (!('saving_history' in user)) user.saving_history = []
      if (!('history_nabung' in user)) user.history_nabung = []
      if (!('history_penarikan' in user)) user.history_penarikan = []
   } else {
      global.db.users.push({
         jid: m.sender,
     	   afk: -1,
         afkReason: '',
         afkObj: {},
         name: m.pushName,
         banned: false,
         nama: 0,
         ban_temporary: 0,
         ban_times: 0,
         username: '',
         limit: env.limit,
         premium: false,
         chil: false,
         VIP: false,
helper: false,
girls: false,
member: false,
moderator: false,
veteran: false,
active: false,
pintar: false,
hellboy: false,
fuckboy: false,
bocil: false, 
rusuh: false,
solution: false,
gay: false,
ace: false,
bots: false,
administrator: false,
bully: false,
andalanOwner: false,
         expired: 0,
         lastseen: 0,
         panen: 0,
         bibit: 0,
         lastrob: 0,
         sarung: 0,

cangkul: 0,

palu: 0,

payung: 0,

traktor: 0,

sabit: 0,

rompi: 0,

leser: 0,

sapi: 0,

ayam: 0,

naga: 0,

serigala: 0,

landak: 0,

kura: 0,

kelinci: 0,

flaming: 0,

singa: 0,

kanguru: 0,

ikan: 0,

anjing: 0,

bebek: 0,

buaya: 0,

uta: 0,

lumba: 0,
         hit: 0,
         spine: 0,
         warning: 0,
         guard: 0,
         point: 0,
         own: 0,
         bio: '',
         lastseen: 0,
         lastclaim: 0,
         lastburu: 0,
         lastspin: 0,
         code: '',
         codeExpire: 0,
         attempt: 0,
         email: '',
         verified: false,
         partner: '',
         authentication: false,
         tabungan: 0,
         saving: 0,
         transfer_history: [],
         saving_history: [],
         history_nabung: [],
         history_penarikan: []
      })
   }

   if (m.isGroup) {
      let group = global.db.groups.find(v => v.jid == m.chat)
      if (group) {
         if (!isNumber(group.activity)) group.activity = 0
         if (!('antidelete' in group)) group.antidelete = true
         if (!('antilink' in group)) group.antilink = true
         if (!('antivirtex' in group)) group.antivirtex = true
         if (!('filter' in group)) group.filter = false
         if (!('left' in group)) group.left = false
         if (!('localonly' in group)) group.localonly = false
         if (!('mute' in group)) group.mute = false
         if (!('viewonce' in group)) group.viewonce = true
         if (!('autosticker' in group)) group.autosticker = true
         if (!('member' in group)) group.member = {}
         if (!('text_left' in group)) group.text_left = ''
         if (!('text_welcome' in group)) group.text_welcome = ''
         if (!('welcome' in group)) group.welcome = true
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
   	if (!('debug' in setting)) setting.debug = false
      if (!('error' in setting)) setting.error = []
      if (!('hidden' in setting)) setting.hidden = []
      if (!('pluginDisable' in setting)) setting.pluginDisable = []
      if (!('groupmode' in setting)) setting.groupmode = false
      if (!('troll' in setting)) setting.troll = true
      if (!('sk_pack' in setting)) setting.sk_pack = 'by'
      if (!('sk_author' in setting)) setting.sk_author = 'AlesyaBots 623132988099'
      if (!('self' in setting)) setting.self = false
      if (!('noprefix' in setting)) setting.noprefix = false
      if (!('multiprefix' in setting)) setting.multiprefix = true
      if (!('prefix' in setting)) setting.prefix = ['.', '/', '!', '#']
      if (!('toxic' in setting)) setting.toxic = ["ajg", "ajig", "anjas", "anjg", "anjim", "anjing", "anjrot", "anying", "asw", "autis", "babi", "bacod", "bacot", "bagong", "bajingan", "bangsad", "bangsat", "bastard", "bego", "bgsd", "biadab", "biadap", "bitch", "bngst", "bodoh", "bokep", "cocote", "coli", "colmek", "comli", "dajjal", "dancok", "dongo", "fuck", "gelay", "goblog", "goblok", "guoblog", "guoblok", "hairul", "henceut", "idiot", "itil", "jamet", "jancok", "jembut", "jingan", "kafir", "kanjut", "kanyut", "keparat", "kntl", "kontol", "lana", "loli", "lont", "lonte", "mancing", "meki", "memek", "ngentod", "ngentot", "ngewe", "ngocok", "ngtd", "njeng", "njing", "njinx", "oppai", "pantek", "pantek", "peler", "pepek", "pilat", "pler", "pornhub", "pucek", "puki", "pukimak", "redhub", "sange", "setan", "silit", "telaso", "tempek", "tete", "titit", "toket", "tolol", "tomlol", "tytyd", "wildan", "xnxx"]
      if (!('online' in setting)) setting.online = true
      if (!('onlyprefix' in setting)) setting.onlyprefix = '+'
      if (!('owners' in setting)) setting.owners = ['994408364923']
      if (!isNumber(setting.lastReset)) setting.lastReset = new Date * 1
      if (!isNumber(setting.lastPagi)) setting.lastPagi = new Date * 1
      if (!isNumber(setting.lastMalam)) setting.lastMalam = new Date * 1
      if (!('msg' in setting)) setting.msg = 'Hi +tag 🪸\nI am an automated system (WhatsApp Bot) that can help to do something, search and get data / information only through WhatsApp.\n\n◦ *Database* : +db\n◦ *Library* : Baileys v+version\n◦ *Rest API* : https://api.neoxr.my.id\n◦ *Source* : https://github.com/neoxr/wbot\n\nIf you find an error or want to upgrade premium plan contact the owner.'
      if (!isNumber(setting.style)) setting.style = 4
      if (!('verify' in setting)) setting.verify = false
      if (!isNumber(setting.uploadSize)) setting.uploadSize = 0
      if (!isNumber(setting.receiveSize)) setting.receiveSize = 0
      if (!isNumber(setting.messageSent)) setting.messageSent = 0
      if (!isNumber(setting.messageReceive)) setting.messageReceive = 0
      if (!('cover' in setting)) setting.cover = 'https://telegra.ph/file/d5a48b03b80791b50717f.jpg'
      if (!('link' in setting)) setting.link = 'https://chat.whatsapp.com/D4OaImtQwH48CtlR0yt4Ff'
   } else {
      global.db.setting = {
         autodownload: true,
         debug: false,
         error: [],
         hidden: [],
         pluginDisable: [],
         groupmode: false,
         sk_pack: 'by',
         sk_author: 'AlesyaBots 623132988099',
         self: false,
         troll: false,
         noprefix: false,
         multiprefix: true,
         prefix: ['.', '#', '!', '/'],
         toxic: ["ajg", "ajig", "anjas", "anjg", "anjim", "anjing", "anjrot", "anying", "asw", "autis", "babi", "bacod", "bacot", "bagong", "bajingan", "bangsad", "bangsat", "bastard", "bego", "bgsd", "biadab", "biadap", "bitch", "bngst", "bodoh", "bokep", "cocote", "coli", "colmek", "comli", "dajjal", "dancok", "dongo", "fuck", "gelay", "goblog", "goblok", "guoblog", "guoblok", "hairul", "henceut", "idiot", "itil", "jamet", "jancok", "jembut", "jingan", "kafir", "kanjut", "kanyut", "keparat", "kntl", "kontol", "lana", "loli", "lont", "lonte", "mancing", "meki", "memek", "ngentod", "ngentot", "ngewe", "ngocok", "ngtd", "njeng", "njing", "njinx", "oppai", "pantek", "pantek", "peler", "pepek", "pilat", "pler", "pornhub", "pucek", "puki", "pukimak", "redhub", "sange", "setan", "silit", "telaso", "tempek", "tete", "titit", "toket", "tolol", "tomlol", "tytyd", "wildan", "xnxx"],
         online: true,
         onlyprefix: '+',
         owners: ['994408364923'],
         lastPagi: new Date * 1,
         lastMalam: new Date * 1,
         lastReset: new Date * 1,
         msg: 'Hi +tag 🪸\nI am an automated system (WhatsApp Bot) that can help to do something, search and get data / information only through WhatsApp.\n\n◦ *Database* : +db\n◦ *Library* : Baileys v+version\n◦ *Rest API* : https://api.neoxr.my.id\n◦ *Source* : https://github.com/neoxr/wbot\n\nIf you find an error or want to upgrade premium plan contact the owner.',
         style: 4,
         verify: false,
         uploadSize: 0,
         receiveSize: 0,
         messageSent: 0,
         messageReceive: 0,
         cover: 'https://telegra.ph/file/d5a48b03b80791b50717f.jpg',
         link: 'https://chat.whatsapp.com/D4OaImtQwH48CtlR0yt4Ff'
      }
   }
}
