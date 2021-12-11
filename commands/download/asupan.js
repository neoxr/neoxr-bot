exports.run = {
	usage: ['asupan', '+asupan', '-asupan'],
	async: async (m, { client, args, isPrefix, command, isOwner }) => {
	try {
		if (command == 'asupan') {
			if (!args[0] && global.db.setting.asupan.length == 0) return client.reply(m.chat, Func.texted('bold', `Blank data, please insert some username from Tiktok account.`), m)
			for(let i = 0; i < global.db.setting.asupan.length; i++) {
				let random = Math.floor(global.db.setting.asupan.length * Math.random())
				var query = global.db.setting.asupan[random]
			} 
			let q = args[0] ? args[0] : query
			client.reply(m.chat, global.status.getdata, m)
			let json = await Api.asupan(q)
			if (!json.status) return client.reply(m.chat, Func.texted('bold', `Video are not available, you can try again.`), m)
			let caption = `❏  *A S U P A N*\n\n`
			caption += `	›  *Author* : ${json.author}\n`
			caption += `	›  *Publish* : ${json.publish}\n`
			caption += `	›  *Likes* : ${json.likes}\n`
			caption += `	›  *Comments* : ${json.comments}\n`
			caption += `	›  *Shares* : ${json.shares}\n\n`
			caption += global.footer
			client.sendVideo(m.chat, await Func.fetchBuffer(json.data.videoSD), caption, m)
		} else if (command == '+asupan') {
			if (!isOwner) return client.reply(m.chat, global.status.god, m)
			if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, '@hosico_cat'), m)
			if (global.db.setting.asupan.includes(args[0])) return client.reply(m.chat, Func.texted('bold', `${args[0].startsWith('@') ? 'Username' : 'Hastag'} is ​​already in the database.`), m)
			global.db.setting.asupan.push(args[0])
			global.db.setting.asupan.sort(function(a, b) {
    			if(a < b ) { return -1; }
    			if(a > b) { return 1; }
    			return 0
			})
			client.reply(m.chat, Func.texted('bold', `'${args[0]}' added successfully!`), m)
		} else if (command == '-asupan') {
			if (!isOwner) return client.reply(m.chat, global.status.god, m)
			if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, '@hosico_cat'), m)
			if (global.db.setting.asupan.length < 2) return client.reply(m.chat, Func.texted('bold', `Sorry, you can't remove more.`), m)
			if (!global.db.setting.asupan.includes(args[0])) return client.reply(m.chat, Func.texted('bold', `'${args[0]}' not in database.`), m)
			global.db.setting.asupan.forEach((data, index) => {
				if (data === args[0]) global.db.setting.asupan.splice(index, 1)
			}) 
			client.reply(m.chat, Func.texted('bold', `'${args[0]}' has been removed.`), m)
		}
	} catch (e) {
		console.log(e)
		client.reply(m.chat, require('util').format(e), m)
		// return client.reply(m.chat, global.status.error, m)
	}},
	error: false,
	cache: true,
	location: __filename
}