import 'dotenv/config'
import 'rootpath'
import { spawn } from 'child_process'
import path from 'path'
import CFonts from 'cfonts'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.clear()

let p = null

function start() {
   const args = [path.join(__dirname, 'client.js'), ...process.argv.slice(2)]
   p = spawn(process.argv[0], args, {
      stdio: ['inherit', 'inherit', 'inherit', 'ipc']
   })
      .on('message', data => {
         if (data === 'reset') {
            console.log('Restarting...')
            p.kill()
            p = null
         }
      })
      .on('exit', code => {
         console.error('Exited with code:', code)
         start()
      })
}

const major = parseInt(process.versions.node.split('.')[0], 10)
if (major < 20) {
   console.error(
      `\n❌ This script requires Node.js 20+ to run reliably.\n` +
      `   You are using Node.js ${process.versions.node}.\n` +
      `   Please upgrade to Node.js 20+ to proceed.\n`
   )
   process.exit(1)
}

CFonts.say('NEOXR BOT', {
   font: 'tiny',
   align: 'center',
   colors: ['system']
})
CFonts.say('Github : https://github.com/neoxr/neoxr-bot', {
   colors: ['system'],
   font: 'console',
   align: 'center'
})
start()