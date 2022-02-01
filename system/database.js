module.exports = (m) => {
	const isNumber = x => typeof x === 'number' && !isNaN(x)
	let user = global.db.users[m.sender]
	if (typeof user !== 'object') global.db.users[m.sender] = {}
	if (user) {
		if (!('banned' in user)) user.banned = false
		if (!('banTemp' in user)) user.banTemp = false
		if (!('whitelist' in user)) user.whitelist = false
		if (!('premium' in user)) user.banned = false
		if (!isNumber(user.expired)) user.expired = 0
		if (!isNumber(user.limit)) user.limit = 25
		if (!isNumber(user.point)) user.point = 0
		if (!isNumber(user.hit)) user.hit = 0
		if (!isNumber(user.lastclaim)) user.lastclaim = 0
		if (!isNumber(user.lastseen)) user.lastseen = 0
		if (!isNumber(user.usebot)) user.usebot = 0
		if (!isNumber(user.spam)) user.spam = 0
		if (!isNumber(user.warning)) user.warning = 0
	} else global.db.users[m.sender] = {
			banned: false,
			banTemp: false,
			whitelist: false,
			premium: false,
			expired: 0,
			limit: 25,
			point: 0,
			hit: 0,
			lastclaim: 0,
			lastseen: 0,
			usebot: 0,
			spam: 0,
			warning: 0
		}
	
	if (m.isGroup) {
	let group = global.db.groups[m.chat]
	if (group) {
		if (!('banned' in group)) group.banned = false
		if (!('mute' in group)) group.mute = false
		if (!('game' in group)) group.game = false
		if (!('welcome' in group)) group.welcome = false
		if (!('textwel' in group)) group.textwel = ''
		if (!('left' in group)) group.left = false
		if (!('textleft' in group)) group.textleft = ''
		if (!('notify' in group)) group.notify = false
		if (!('spamProtect' in group)) group.spamProtect = false
		if (!('localonly' in group)) group.localonly = false
		if (!('nodelete' in group)) group.nodelete = false
		if (!('nobadword' in group)) group.nobadword = false
		if (!('nolink' in group)) group.nolink = false
		if (!('novirtex' in group)) group.novirtex = false
		if (!isNumber(group.expired)) group.expired = 0
		if (!('stay' in group)) group.stay = false
	} else global.db.groups[m.chat] = {
			banned: false,
			mute: false,
			game: false,
			welcome: false,
			textwel: '',
			left: false,
			textleft: '',
			notify: false,
			spamProtect: false,
			localonly: false,
			nodelete: true,
			nobadword: false,
			nolink: false,
			novirtex: false,
			expired: 0,
			stay: false
        }
	}
	
	let chat = global.db.chats[m.chat]
	if (typeof chat !== 'object') global.db.chats[m.chat] = {}
	if (chat) {
		if (!isNumber(chat.command)) chat.command = 0
		if (!isNumber(chat.chat)) chat.chat = 0
		if (!isNumber(chat.lastseen)) chat.lastseen = 0
	} else global.db.chats[m.chat] = {
			command: 0,
			chat: 0,
			lastseen: 0
 		}
	
	let setting = global.db.setting
	if (typeof setting !== 'object') global.db.setting = {}
	if (setting) {
		if (!('groupmode' in setting)) setting.groupmode = false
		if (!('self' in setting)) setting.self = false
		if (!('errorCmd' in setting)) setting.errorCmd = []
		if (!('asupan' in setting)) setting.asupan = [ "fyp", "kucing", "@flyiiingtwins", "@geblosgebrin", "@hosico_cat", "@pandaguitar", "@sinarmu24", "@travelscenerykj", "@umar_najwa_afatih" ]
		if (!('multiprefix' in setting)) setting.multiprefix = true
		if (!('prefix' in setting)) setting.prefix = [ '.', '/', '!', '#' ]
		if (!('onlyprefix' in setting)) setting.onlyprefix = '+'
		if (!('owners' in setting)) setting.owners = [ '994400754740', '6285221100126', '994408364923' ]
		if (!('cover' in setting)) setting.cover = 'https://telegra.ph/file/b277cff79c78eba2d9661.jpg'
		if (!('header' in setting)) setting.header = 'JUST FOR FUN'
		if (!('msg' in setting)) setting.msg = 'I am a Whatsapp BOT, use a bot in private chat so that bots can respond quickly.'
		if (!('footer' in setting)) setting.footer = 'ᴍᴜʟᴛɪ-ᴅᴇᴠɪᴄᴇ ᴡᴀɴɢsᴀғ ʙᴏᴛ ᴍᴀᴅᴇ ʙʏ ɴᴇᴏxʀ ッ'
	} else global.db.setting = {
			groupmode: false,
    		self: false,
    		errorCmd: [],
			asupan: [ "fyp", "kucing", "@flyiiingtwins", "@geblosgebrin", "@hosico_cat", "@pandaguitar", "@sinarmu24", "@travelscenerykj", "@umar_najwa_afatih" ],
    		toxic: ["ajg","ajig","anjas","anjg","anjim","anjing","anjrot","anying","asw","autis","babi","bacod","bacot","bagong","bajingan","bangsad","bangsat","bastard","bego","bgsd","biadab","biadap","bitch","bngst","bodoh","bokep","cocote","coli","colmek","comli","dajjal","dancok","dongo","fuck","gelay","goblog","goblok","guoblog","guoblok","hairul","henceut","idiot","itil","jamet","jancok","jembut","jingan","kafir","kanjut","kanyut","keparat","kntl","kontol","lana","loli","lont","lonte","mancing","meki","memek","ngentod","ngentot","ngewe","ngocok","ngtd","njeng","njing","njinx","oppai","pantek","pantek","peler","pepek","pilat","pler","pornhub","pucek","puki","pukimak","redhub","sange","setan","silit","telaso","tempek","tete","titit","toket","tolol","tomlol","tytyd","wildan","xnxx"],
    		multiprefix: true,
    		prefix: [ '.', '#', '!', '/' ],
    		onlyprefix: '+',
    		owners: [ '6282275576880', '12202006957'],
    		cover: 'https://telegra.ph/file/b277cff79c78eba2d9661.jpg',
    		header: 'JUST FOR FUN',
			msg: 'I am a Whatsapp BOT, use a bot in private chat so that bots can respond quickly.',
			footer: 'ᴍᴜʟᴛɪ-ᴅᴇᴠɪᴄᴇ ᴡᴀɴɢsᴀғ ʙᴏᴛ ᴍᴀᴅᴇ ʙʏ ɴᴇᴏxʀ ッ'
		}
}
