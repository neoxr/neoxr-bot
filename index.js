console.log('Starting . . .')
let {
    spawn: spawn
} = require('child_process'), path = require('path'), CFonts = require('cfonts')

function start() {
	let args = [path.join(__dirname, 'client.js'), ...process.argv.slice(2)]
	// console.log([process.argv[0], ...args].join('\n'))
	let p = spawn(process.argv[0], args, { stdio: ['inherit', 'inherit', 'inherit', 'ipc'] })
	.on('message', data => {
		if (data == 'reset') {
			console.log('Restarting...')
			p.kill()
			start()
			delete p
		}
	})
	.on('exit', code => {
		console.error('Exited with code:', code)
		if (code == 1) start()
	})
}

CFonts.say('NEOXR BOT', {
    font: 'tiny',
    align: 'center',
    colors: ['system']
}), CFonts.say('Github : https://github.com/neoxr/neoxr-bot-md', {
    colors: ['system'],
    font: 'console',
    align: 'center'
}), start()