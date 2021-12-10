const fs = require('fs')
const util = require('util')

module.exports = async (client, m, chatUpdate) => {
    try {  
		if (m.fromMe || m.isBot || m.chat.endsWith('broadcast')) return
        const pushname = m.pushName || "No Name"
        const isOwner = [ client.user.id, ...global.owner ].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
        const groupMetadata = m.isGroup ? await client.groupMetadata(m.chat).catch(e => {}) : ''
        const groupName = m.isGroup ? groupMetadata.subject : ''
        const participants = m.isGroup ? await groupMetadata.participants : ''
		// const groupAdmins = m.isGroup ? await getGroupAdmins(participants) : ''
		// const isBotAdmins = m.isGroup ? groupAdmins.includes(m.sender) : false
		// const isGroupAdmins = m.isGroup ? groupAdmins.includes(m.sender) : false
		// require('./system/exec')(client, m, isOwner)
	
	let setting = {
		multiprefix: true,
		prefix: [ '.', '/', '!', '#', '+' ],
		onlyprefix: '+'
	}
	let cPref = (typeof m.text != 'object') ? m.text.trim().split('\n')[0].split(' ')[0] : ''
	if (setting.multiprefix ? setting.prefix.includes(cPref.slice(0,1)) : setting.onlyprefix == cPref.slice(0,1)) {
		var myPrefix = cPref.slice(0,1)
		// var prefix = new RegExp('^[' + (myPrefix) + ']')
	}

	if (typeof m.text != 'object' && m.text == myPrefix) {
		let old = new Date()
		await client.reply(m.chat, Func.texted('bold', `Checking . . .`), m)
		return client.reply(m.chat, Func.texted('bold', `Response Speed : ${((new Date - old)*1)}s`), m)
	}

	let isPrefix
	if (typeof m.text != 'object' && m.text && m.text.length != 1 && (isPrefix = (myPrefix || '')[0])) {
		let args = m.text.replace(isPrefix, '').split` `.filter(v=>v)
		let command = args.shift().toLowerCase()
		let noPrefix = m.text.replace(isPrefix, '')
		let _args = noPrefix.trim().split` `.slice(1)
        let text = _args.join` `
	for (let n in client.commands) {
		let cmd = client.commands[n].run
		let turn = cmd.usage instanceof RegExp ? cmd.usage.test(command) : cmd.usage instanceof Array ? cmd.usage.includes(command) : cmd.usage instanceof String ? cmd.usage == command : false
		if (!m.text.startsWith('>') && !m.text.startsWith('=>') && !m.text.startsWith('?>') && !m.text.startsWith('$')) {
			if (!m.text.startsWith(myPrefix)) return
		}
		if (!turn) continue
		if (typeof cmd.cache != 'undefined' && cmd.cache && typeof cmd.location != 'undefined') {
			let file = require.resolve(cmd.location)
			Func.reload(file)
		}
		if (typeof cmd.error !== 'undefined' && cmd.error) {
			client.reply(m.chat, global.status.errorF, m)
			continue
		}
		if (typeof cmd.owner !== 'undefined' && cmd.owner && !isOwner) { 
			client.reply(m.chat, global.status.owner, m)
            continue
		}
		if (typeof cmd.god !== 'undefined' && cmd.god && !isGod) { 
			client.reply(m.chat, global.status.god, m)
            continue
		}
		if (typeof cmd.group !== 'undefined' && cmd.group && !m.isGroup) {
			client.reply(m.chat, global.status.group, m)
            continue
		}
		if (typeof cmd.private !== 'undefined' && cmd.private && m.isGroup) {
            client.reply(m.chat, global.status.private, m)
            continue
		}
		cmd.async(m, { client, args, text, isPrefix, command, isOwner })
		break
			}
		}
    } catch (err) {
        m.reply(util.format(err))
    }
}

Func.reload(require.resolve(__filename))