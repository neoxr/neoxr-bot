export const models = {
   get users() {
      return {
         afk: -1,
         afkReason: '',
         afkObj: {},
         banned: false,
         ban_temporary: 0,
         ban_times: 0,
         premium: false,
         expired: 0,
         lastseen: 0,
         hit: 0,
         warning: 0
      }
   },
   get groups() {
      return {
         activity: 0,
         antilink: false,
         filter: false,
         left: false,
         mute: false,
         text_left: '',
         text_welcome: '',
         welcome: true,
         expired: 0,
         stay: false
      }
   },
   get chats() {
      return {
         chat: 0,
         lastchat: 0,
         lastseen: 0
      }
   },
   get setting() {
      return {
         autobackup: false,
         antispam: true,
         debug: false,
         notifier: false,
         error: [],
         hidden: [],
         pluginDisable: [],
         groupmode: false,
         self: false,
         noprefix: false,
         multiprefix: true,
         prefix: ['.', '#', '!', '/'],
         toxic: ["ajg", "ajig", "anjas", "anjg", "anjim", "anjing", "anjrot", "anying", "asw", "autis", "babi", "bacod", "bacot", "bagong", "bajingan", "bangsad", "bangsat", "bastard", "bego", "bgsd", "biadab", "biadap", "bitch", "bngst", "bodoh", "bokep", "cocote", "coli", "colmek", "comli", "dajjal", "dancok", "dongo", "fuck", "gelay", "goblog", "goblok", "guoblog", "guoblok", "hairul", "henceut", "idiot", "itil", "jamet", "jancok", "jembut", "jingan", "kafir", "kanjut", "kanyut", "keparat", "kntl", "kontol", "lana", "loli", "lont", "lonte", "mancing", "meki", "memek", "ngentod", "ngentot", "ngewe", "ngocok", "ngtd", "njeng", "njing", "njinx", "oppai", "pantek", "pantek", "peler", "pepek", "pilat", "pler", "pornhub", "pucek", "puki", "pukimak", "redhub", "sange", "setan", "silit", "telaso", "tempek", "tete", "titit", "toket", "tolol", "tomlol", "tytyd", "wildan", "xnxx"],
         onlyprefix: '+',
         owners: [],
         lastReset: new Date * 1,
         msg: 'Hi +tag 🪸\nI am an automated system (WhatsApp Bot) that can help to do something, search and get data / information only through WhatsApp.\n\n◦ *Module* : +module\n◦ *Database* : +db\n◦ *Library* : Baileys +version\n\nIf you find an error or want to upgrade premium plan contact the owner.',
         style: 4,
         cover: 'https://i.pinimg.com/736x/c7/2c/b0/c72cb05eb27c7d52e9cfa0cea059b1c8.jpg',
      }
   },
   get setup() {
      return {
         operators: []
      }
   },
   get structure() {
      return { users: [], chats: [], groups: [], bots: [], statistic: {}, sticker: {}, setting: this.setting, setup: this.setup }
   }
}