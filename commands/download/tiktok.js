exports.run = {
	usage: ['tiktok', 'tikmp3', 'tikwm'],
	async: async (m, { client, args, isPrefix, command }) => {
	try {
		if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'https://vt.tiktok.com/ZSe22y3dA'), m)
		client.reply(m.chat, global.status.getdata, m)
		let json = await Api.tiktok(args[0])
		if (!json.status) return client.reply(m.chat, global.status.fail, m)
		if (command == 'tiktok') return client.sendVideo(m.chat, json.data.video, '', m)
		if (command == 'tikmp3') return !json.data.audio ? client.reply(m.chat, global.status.fail, m) : client.sendAudio(m.chat, json.data.audio, false, m)
		if (command == 'tikwm') return client.sendVideo(m.chat, json.data.videoWM, '', m)
	} catch {
		return client.reply(m.chat, global.status.error, m)
	}},
	error: false,
	cache: true,
	location: __filename
}