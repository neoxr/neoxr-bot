exports.run = {
	usage: ['twitter', 'tw'],
	async: async (m, { client, args, isPrefix, command }) => {
	try {
		if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'https://twitter.com/sebatass_kata/status/1409031803290099716?s=20'), m)
		if (!args[0].match(/(twitter.com)/gi)) return client.reply(m.chat, global.status.invalid, m)
		client.reply(m.chat, global.status.getdata, m)
		let json = await Api.twitter(args[0])
		if (!json.status) return client.reply(m.chat, global.status.fail, m)
		client.sendVideo(m.chat, json.data.url, '', m)
	} catch {
		return client.reply(m.chat, global.status.error, m)
	}},
	error: false,
	cache: true,
	location: __filename
}