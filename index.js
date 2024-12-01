if (process.argv.includes('--server')) require('./server')
require('dotenv').config(), require('rootpath')(), console.clear()
const { spawn: spawn } = require('child_process'), { Function: Func } = new(require('@neoxr/wb')), path = require('path'), colors = require('@colors/colors/safe'), CFonts = require('cfonts'), chalk = require('chalk')

const unhandledRejections = new Map()
process.on('uncaughtException', (err) => {
	if (err.code === 'ENOMEM') {
		console.error('Out of memory error detected. Cleaning up resources...');
		// Lakukan tindakan pemulihan seperti membersihkan cache atau log
	} else {
		console.error('Uncaught Exception:', err)
	}
})
process.on('unhandledRejection', (reason, promise) => {
	unhandledRejections.set(promise, reason)
	if (reason.code === 'ENOMEM') {
		console.error('Out of memory error detected. Attempting recovery...');
		Object.keys(require.cache).forEach((key) => {
			delete require.cache[key]
		})
	} else {
		console.log('Unhandled Rejection at:', promise, 'reason:', reason)
	}
})
process.on('rejectionHandled', (promise) => {
	unhandledRejections.delete(promise)
})
process.on('Something went wrong', function (err) {
	console.log('Caught exception: ', err)
})
process.on('warning', (warning) => {
	if (warning.name === 'MaxListenersExceededWarning') {
		console.warn('Potential memory leak detected:', warning.message)
	}
})

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