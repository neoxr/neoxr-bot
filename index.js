import 'dotenv/config'
import { spawn } from 'child_process'
import fs from 'fs/promises'
import path from 'path'
import CFonts from 'cfonts'
import { fileURLToPath } from 'url'
import { Utils } from '@neoxr/zapo'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SESSION_DIR = path.resolve('./sessions')
const TEMP_DIR = path.resolve('./temp')

const ensureSessionDir = async () => {
   try {
      await fs.mkdir(SESSION_DIR, { recursive: true })
   } catch (e) {
      Utils.printError('Failed to ensure temp directory: ' + e)
   }
}

const ensureTempDir = async () => {
   try {
      await fs.mkdir(TEMP_DIR, { recursive: true })
   } catch (e) {
      Utils.printError('Failed to ensure temp directory: ' + e)
   }
}

const cleanTemp = async () => {
   try {
      const files = await fs.readdir(TEMP_DIR)

      await Promise.all(
         files.map(async file => {
            if (file.endsWith('.file')) return

            const filePath = path.join(TEMP_DIR, file)
            try {
               const stats = await fs.stat(filePath)
               if (stats.isFile()) await fs.unlink(filePath)
            } catch {
               Utils.printWarning(`Skip failed file: ${file}`)
            }
         })
      )
   } catch (e) {
      Utils.printError('Error reading temp directory: ' + e)
   }
}

const startAutoClean = async () => {
   await ensureSessionDir()
   await ensureTempDir()
   cleanTemp()
   setInterval(cleanTemp, 60 * 60 * 1000) // 1 hours
}

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

console.clear()
const major = parseInt(process.versions.node.split('.')[0], 10)
if (major < 22) {
   console.error(
      `\n❌ This script requires Node.js 22+ to run reliably.\n` +
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
startAutoClean()