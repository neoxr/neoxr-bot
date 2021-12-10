let { useSingleFileAuthState, DisconnectReason } = require("@adiwajshing/baileys-md")
let { state, saveState } = useSingleFileAuthState(`./session.json`)
let pino = require('pino'), path = require('path')
let { Socket, Serialize, Scandir } = require('./system/extra')
let { Function } = require('./system/function')
global.Func = new Function

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
			lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut ? start() : console.log('Koneksi Terputus...')
		}
		console.log('Koneksi Terhubung...', update)
	})
	
	client.ev.on('messages.upsert', async chatUpdate => {
        try {
        m = chatUpdate.messages[0]
        if (!m.message) return
        m.message = (Object.keys(m.message)[0] === 'ephemeralMessage') ? m.message.ephemeralMessage.message : m.message
        if (m.key && m.key.remoteJid === 'status@broadcast') return
        if (!m.key.fromMe && chatUpdate.type === 'notify') return
        if (m.key.id.startsWith('BAE5') && m.key.id.length === 16) return
        m = Serialize(client, m)
		
		Scandir('./commands').then(files => {
			client.commands = Object.fromEntries(files.filter(v => v.endsWith('.js')).map(file => [ path.basename(file).replace('.js', ''), require(file) ]))
		}).catch(e => console.error(e))
    	    require('./system/config'), require('./handler')(client, m)
        } catch (err) {
            console.log(err)
        }
    })

	client.ev.on('creds.update', saveState)
	return client
}

start()