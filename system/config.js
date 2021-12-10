global.owner = ['994400754740', '380944649449', '6285221100126']
global.max_upload = 90 // 90MB (1 = 1MB)
global.status = {
	wait: Func.texted('bold', 'Processed . . .'),
	invalid: Func.texted('bold', 'URL is Invalid!'),
	wrong: Func.texted('bold', 'Wrong format!'),
	getdata: Func.texted('bold', 'Scraping metadata . . .'),
	fail: Func.texted('bold', 'Can\'t get metadata!'),
	error: Func.texted('bold', 'Error occurred!'),
	errorF: Func.texted('bold', 'Sorry this feature is in error.'),
	premium: Func.texted('bold', 'This feature only for premium user.'),
	owner: Func.texted('bold', 'This command only for owner.'),
	god: Func.texted('bold', 'This command only for Master'),
	group: Func.texted('bold', 'This command will only work in groups.'),
	botAdmin: Func.texted('bold', 'This command will work when I become an admin.'),
	admin: Func.texted('bold', 'This command only for group admin.'),
	private: Func.texted('bold', 'Use this command in private chat.')
}

global.users = global.db.users
global.groups = global.db.groups
global.chats = global.db.chats
global.media = global.db.media
global.sticker = global.db.sticker
global.statistic = global.db.statistic
global.bots = global.db.bots