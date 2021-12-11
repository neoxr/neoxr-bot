exports.run = {
	usage: ['menu', 'help', 'bot'],
	async: async (m, { client, isPrefix, command }) => {
		try {
			let setting = global.setting
			if (/menu|help|bot/.test(command)) return client.buttonLoc(m.chat, menu(isPrefix, m, readmore, setting), '', [
				{ urlButton: { displayText: `Script`, url : `https://github.com/neoxr/neoxr-bot-md`} }
			])
		} catch (e) {
			console.log(e)
		}
	},
	error: false,
	cache: true,
	location: __filename
}

let readmore = String.fromCharCode(8206).repeat(4001)

let menu = (prefix, m, readmore, setting) => {
return `
Hi ${m.pushName || Beib} 🍟

“${setting.msg}”

Mode : ${setting.groupmode ? '*Group Only*' : '*Public*'}
${readmore}
❏   *F E A T U R E S*
	
	◦  ${prefix}asupan
	◦  ${prefix}asupan *hastag*
	◦  ${prefix}asupan *@username*
	◦  ${prefix}ig *link*
	◦  ${prefix}pin *link*
	◦  ${prefix}tiktok *link*
	└  ${prefix}twitter *link*

❏   *S Y S T E M*
	
	◦  ${prefix}addprefix *prefix*
	◦  ${prefix}delprefix *prefix*
	◦  ${prefix}disable *command*
	◦  ${prefix}enable *command*
	◦  ${prefix}groupmode *on / off*
	◦  ${prefix}multiprefix *on / off*
	◦  ${prefix}self *on / off*
	└  ${prefix}setprefix *prefix*

❏   *A D V A N C E*

	◦  > -- (Js Eval)
	◦  => -- (Js Eval Return)
	└  $ -- (Exec)
`}