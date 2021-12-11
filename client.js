let { useSingleFileAuthState, DisconnectReason } = require("@adiwajshing/baileys-md")
let session = process.argv[2] ? process.argv[2] : 'session'
let sessionFile = session + '.json'
let { state, saveState } = useSingleFileAuthState(sessionFile)
let pino = require('pino'), path = require('path')
let StormDB = require('stormdb')
let engine = new StormDB.localFileEngine('./database.json', {
	serialize: data => {
		return JSON.stringify(data, null, 3)
	}
})
let database = new StormDB(engine)
let { Socket, Serialize, Scandir } = require('./system/extra')
let { Function } = require('./system/function')
global.Func = new Function
let { NeoxrApi } = require('./system/scraper')
global.Api = new NeoxrApi('yourkey')

const start = async () => { 
	global.client = Socket({
		logger: pino({ level: 'silent' }),
		printQRInTerminal: true,
		browser: [ '@neoxr / neoxr-bot', 'Opera', '3.0' ],
		auth: state
	})

	client.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update
		if (connection === 'close') {
			lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut ? start() : console.log('Disconnected :(')
		}; console.log('Started!')
		database.default({
			users: {},
			groups: {},
			chats: {},
			statistic: {},
			setting: {}
		}).save()
		global.db = database.state
		global.save = database.save()
	})
	
	client.ev.on('messages.upsert', async chatUpdate => {
        try {
        	m = chatUpdate.messages[0]
			if (!m.message) return
			Serialize(client, m)
			Scandir('./commands').then(files => {
				global.client.commands = Object.fromEntries(files.filter(v => v.endsWith('.js')).map(file => [ path.basename(file).replace('.js', ''), require(file) ]))
			}).catch(e => console.error(e))
    	    require('./system/config'), require('./handler')(client, m)
		} catch (e) {
			console.log(e)
		}
	})

	client.ev.on('creds.update', saveState)
	return client
}

start()