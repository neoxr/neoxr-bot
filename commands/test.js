exports.run = {
	usage: ['t'],
	async: async (m, { client, args, text, isPrefix, command }) => {
		client.reply(m.chat, 'Woooooo!', m)
	},
	error: false,
	cache: true,
	location: __filename
}