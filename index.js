console.log('Starting . . .')
require('dotenv').config(), require('rootpath')(), require('./server')
const { spawn: spawn } = require('child_process'), path = require('path'), colors = require('@colors/colors/safe'), CFonts = require('cfonts')
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'
process.on('uncaughtException', console.error)

function start() {
	let args = [path.join(__dirname, 'client.js'), ...process.argv.slice(2)]
	let p = spawn(process.argv[0], args, { stdio: ['inherit', 'inherit', 'inherit', 'ipc'] })
	.on('message', data => {
		if (data == 'reset') {
			console.log('Restarting...')
			p.kill()
			delete p
		}
	})
	.on('exit', code => {
		console.error('Exited with code:', code)
		start()
	})
}

CFonts.say('NEOXR BOT', {
   font: 'tiny',
   align: 'center',
   colors: ['system']
}), CFonts.say('Github : https://github.com/neoxr/neoxr-bot', {
   colors: ['system'],
   font: 'console',
   align: 'center'
}), start()