import 'dotenv/config'
import { spawn } from 'child_process'
import fs from 'fs/promises'
import path from 'path'
import CFonts from 'cfonts'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const TEMP_DIR = path.resolve('./temp')

const ensureTempDir = async () => {
   try {
      await fs.mkdir(TEMP_DIR, { recursive: true })
   } catch (e) {
      console.log(
         `\x1b[31m[ERROR]\x1b[0m Failed to ensure temp directory: ${e}`
      )
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

               if (stats.isFile()) {
                  await fs.unlink(filePath)
               }
            } catch {
               console.log(
                  `\x1b[33m[WARNING]\x1b[0m Skip failed file: ${file}`
               )
            }
         })
      )
   } catch (e) {
      console.log(
         `\x1b[31m[ERROR]\x1b[0m Error reading temp directory: ${e}`
      )
   }
}

const startAutoClean = async () => {
   await ensureTempDir()
   cleanTemp()
   setInterval(cleanTemp, 60 * 60 * 1000)
}

let p = null

function start() {
   const args = [
      path.join(__dirname, 'client.js'),
      ...process.argv.slice(2)
   ]

   p = spawn(process.argv[0], args, {
      stdio: ['inherit', 'inherit', 'inherit', 'ipc']
   })
      .on('message', data => {
         if (data === 'reset') {
            console.log('\x1b[36m[SYSTEM]\x1b[0m Restarting...')

            p?.kill()
            p = null
         }
      })
      .on('exit', code => {
         console.log(
            `\x1b[90m[SYSTEM]\x1b[0m Exited with code: ${code}`
         )

         start()
      })
}

console.clear()

const major = parseInt(process.versions.node.split('.')[0], 10)

if (major < 20) {
   console.log(
      `\n\x1b[31m❌ This script requires Node.js 20+ to run reliably.\x1b[0m\n` +
      `\x1b[33m   You are using Node.js ${process.versions.node}.\x1b[0m\n` +
      `\x1b[33m   Please upgrade to Node.js 20+ to proceed.\x1b[0m\n`
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