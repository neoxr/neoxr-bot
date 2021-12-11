exports.run = {
	usage: ['ig'],
	async: async (m, { client, args, isPrefix, command }) => {
	try {
		if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'https://www.instagram.com/p/CK0tLXyAzEI'), m)
		if (!args[0].match(/(https:\/\/www.instagram.com)/gi)) return client.reply(m.chat, global.status.invalid, m)
		client.reply(m.chat, global.status.getdata, m)
		let json = await Api.ig(Func.igFixed(args[0]))
		if (!json.status) return client.reply(m.chat, global.status.fail, m)
		for(let i = 0; i < json.data.length; i++) {
			if (json.data[i].type == 'mp4') {
				client.sendVideo(m.chat, json.data[i].url, '', m)
			} else if (json.data[i].type == 'jpg') {
				client.sendImage(m.chat, json.data[i].url, '', m)
			} await Func.delay(1000)
		}
	} catch {
		return client.reply(m.chat, global.status.error, m)
	}},
	error: false,
	cache: true,
	location: __filename
}