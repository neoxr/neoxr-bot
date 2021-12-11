exports.run = {
	usage: ['pin'],
	async: async (m, { client, args, isPrefix, command }) => {
	try {
		if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'https://pin.it/5fXaAWE'), m)
		client.reply(m.chat, global.status.getdata, m)
		let json = await Api.pin(args[0])
		if (!json.status) return client.reply(m.chat, global.status.fail, m)
		if (json.data.type == 'mp4') return client.sendVideo(m.chat, json.data.url, '', m)
		if (json.data.type == 'jpg') return client.sendImage(m.chat, json.data.url, '', m)
		if (json.data.type == 'gif') return client.sendVideo(m.chat, json.data.url, '', m, true)
	} catch {
		return client.reply(m.chat, global.status.error, m)
	}},
	error: false,
	cache: true,
	location: __filename
}