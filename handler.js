module.exports = async (client, m) => {
try {  
	require('./system/database')(m)
	let isOwner = [ client.user.id, global.owner, ...global.db.setting.owners ].map(v => v + '@s.whatsapp.net').includes(m.sender)
	let isPrem = (typeof global.users[m.sender] != 'undefined' && global.users[m.sender].premium) || isOwner
	let groupMetadata = m.isGroup ? await client.groupMetadata(m.chat) : {}
	let participants = m.isGroup ? groupMetadata.participants : [] || []
	let adminList = m.isGroup ? await client.groupAdmin(m.chat) : [] || []
	let isAdmin = m.isGroup ? adminList.includes(m.sender) : false
	let isBotAdmin = m.isGroup ? adminList.includes((client.user.id.split`:`[0]) + '@s.whatsapp.net') : false
	let groupSet = global.groups[m.chat]
    let users = global.users[m.sender]
    let chats = global.chats[m.chat]
    global.setting = global.db.setting
	global.cover = global.setting.cover
	global.header = global.setting.header
	global.footer = global.setting.footer
	require('./system/exec')(client, m, isOwner)
	client.sendReadReceipt(m.chat, m.sender, [m.key.id])
	if (m.isBot || m.chat.endsWith('broadcast')) return
	let cPref = (typeof m.text != 'object') ? m.text.trim().split('\n')[0].split(' ')[0] : ''
	if (setting.multiprefix ? setting.prefix.includes(cPref.slice(0,1)) : setting.onlyprefix == cPref.slice(0,1)) {
		var myPrefix = cPref.slice(0,1)
	}
	require('./system/logs')(client, m, myPrefix)
	users.lastseen = new Date() * 1
	chats.lastseen = new Date() * 1
	chats.chat += 1
	if (m.isBot || users.banTemp != 0) return
	if (!m.fromMe && setting.groupmode && !m.isGroup && !isOwner && !isPrem) {
		if (!users.whitelist) {
			return client.reply(m.chat, Func.texted('bold', `Bots can only be used in groups, sorry your number will be blocked`), m).then(async() => {
				await Func.delay(3000).then(async() => await client.updateBlockStatus(m.sender, 'block'))
			})
		}
	}
	if (typeof m.text != 'object' && m.text.startsWith(myPrefix) && !isOwner) { 
    	if (typeof users != 'undefined') users.point += Func.randomInt(100, 500)
		users.hit += 1
		users.usebot = new Date() * 1
	if (new Date() * 1 - chats.command > 5000) { // < 5s per-command
		chats.command = new Date() * 1
	} else {
		if (!m.fromMe) return
		}
	}
	if (((m.isGroup && !groupSet.banned) || !m.isGroup) && !users.banned) {
	if (typeof m.text != 'object' && m.text == myPrefix) {
		let old = new Date()
		let banchat = setting.self ? true : false
	if (!banchat) {
		await client.reply(m.chat, Func.texted('bold', `Checking . . .`), m)
		return client.reply(m.chat, Func.texted('bold', `Response Speed : ${((new Date - old)*1)}s`), m)
	} else {
		await client.reply(m.chat, Func.texted('bold', `Checking . . .`), m)
		return client.reply(m.chat, Func.texted('bold', `Response Speed : ${((new Date - old)*1)}s (nonaktif)`), m)
			}
		}
	}
	// IF SELF MODE
	if (setting.self) if (!m.fromMe && !isOwner) return
	if (typeof m.text != 'object' && setting.errorCmd.includes(m.text.split` `[0].substring(1).trim())) {
		return client.reply(m.chat, Func.texted('bold', `Command _${m.text.split` `[0].trim()}_ is disabled by Owner.`), m)
	}
	function join(arr) {
    	var construct = []
    	for (var i = 0; i < arr.length; i++) construct = construct.concat(arr[i])
    	return construct
	}
	let cmds = client.commands != null ? Object.values(client.commands) : []
	let collect = []
	for (let i=0; i<cmds.length; i++) collect.push(cmds[i].run.usage)
	if (typeof m.text !== 'object') {
		let thisCmd = m.text.split` `[0].replace(myPrefix, '').trim()
		if (join(collect).includes(thisCmd)) {
			if (typeof global.statistic[thisCmd] == 'undefined') {
				global.statistic[thisCmd] = {
					hitstat: 1,
					lasthit: new Date * 1,
					sender: m.sender.split`@`[0]
				}
			} else {
				global.statistic[thisCmd].hitstat += 1
				global.statistic[thisCmd].lasthit = new Date * 1
				global.statistic[thisCmd].sender = m.sender.split`@`[0]
			}
		}
	}
	let isPrefix
	if (typeof m.text != 'object' && m.text && m.text.length != 1 && (isPrefix = (myPrefix || '')[0])) {
		let args = m.text.replace(isPrefix, '').split` `.filter(v=>v)
		let command = args.shift().toLowerCase()
		let start = m.text.replace(isPrefix, '')
		let clean = start.trim().split` `.slice(1)
        let text = clean.join` `
	for (let name in global.client.commands) {
		let cmd = global.client.commands[name].run
		let turn = cmd.usage instanceof Array ? cmd.usage.includes(command) : cmd.usage instanceof String ? cmd.usage == command : false
		// cmd.usage.constuctor.name == 'Array' ? cmd.usage.includes(command) : cmd.usage.constructor.name == 'String' ? cmd.usage == command : false
		if (!m.text.startsWith('>') && !m.text.startsWith('=>') && !m.text.startsWith('?>') && !m.text.startsWith('$')) {
			if (!m.text.startsWith(myPrefix)) return
		}
		if (!turn) continue
		if (typeof cmd.cache != 'undefined' && cmd.cache && typeof cmd.location != 'undefined') {
			let file = require.resolve(cmd.location)
			Func.reload(file)
		}
		if (typeof cmd.error != 'undefined' && cmd.error) {
			client.reply(m.chat, global.status.errorF, m)
			continue
		}
		if (typeof cmd.owner != 'undefined' && cmd.owner && !isOwner) { 
			client.reply(m.chat, global.status.owner, m)
            continue
		}
		if (typeof cmd.premium != 'undefined' && cmd.premium && !isPrem) { 
			client.reply(m.chat, global.status.premium, m)
            continue
		}
		if (typeof cmd.limit != 'undefined' && cmd.limit && !isPrem && global.users[m.sender].limit > 0) {
			global.users[sender].limit -= cmd.limit || 1
		}
		if (typeof cmd.limit != 'undefined' && cmd.limit && !isPrem && global.users[m.sender].limit == 0) {
			client.reply(m.chat, Func.texted('bold', `Sorry @${sender.split`@`[0]}, you don't have a limit, please exchange it with your points first.`), m)
			continue
		}
		if (typeof cmd.group != 'undefined' && cmd.group && !m.isGroup) {
			client.reply(m.chat, global.status.group, m)
            continue
		} else if (typeof cmd.botAdmin != 'undefined' && cmd.botAdmin && !isBotAdmin) {
            client.reply(m.chat, global.status.botAdmin, m)
            continue
		} else if (typeof cmd.admin != 'undefined' && cmd.admin && !isAdmin) {
            client.reply(m.chat, global.status.admin, m)
            continue
		}
		if (typeof cmd.private != 'undefined' && cmd.private && m.isGroup) {
            client.reply(m.chat, global.status.private, m)
            continue
		}
		cmd.async(m, { client, args, text, isPrefix, command, participants, isOwner })
		break
			}
		}
    } catch (err) {
        client.reply(m.chat, require('util').format(err), m)
    }
}

Func.reload(require.resolve(__filename))