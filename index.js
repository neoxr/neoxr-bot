console.log('Starting . . .')
let {
    spawn: spawn
} = require('child_process'), path = require('path'), CFonts = require('cfonts')

function start() {
    let t = [path.join(__dirname, 'client.js'), ...process.argv.slice(2)],
	e = spawn(process.argv[0], t, {
		stdio: ['inherit', 'inherit', 'inherit', 'ipc']
	}).on('message', t => {
		'reset' == t && (e.kill(), start(), delete e)
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