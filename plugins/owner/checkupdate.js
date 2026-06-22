import { exec } from 'child_process'
import util from 'util'

const execPromise = util.promisify(exec)

export const run = [{
   usage: ['checkupdate'],
   hidden: ['cu'],
   category: 'owner',
   async: async (m, { client }) => {
      try {
         client.sendReact(m.chat, '🕒', m.key)

         let { stdout: logOutput } = await execPromise('git log -1 --stat')
         const { stdout: statusOutput } = await execPromise('git status -s')

         logOutput = censorTextEmail(logOutput)

         let message = `🚩 *LATEST UPDATE*\n\n${logOutput.trim()}`

         if (statusOutput.trim()) {
            message += `\n\n🚩 *LOCAL CHANGES*\n\n${statusOutput.trim()}`
         }

         client.reply(m.chat, message, m)
      } catch (e) {
         const errorMessage = e.stderr || e.stdout || e.message || String(e)
         client.reply(m.chat, `❌ Failed to fetch logs:\n\n${errorMessage}`, m)
      }
   },
   owner: true
}, {
   usage: ['checkpending'],
   hidden: ['cp'],
   category: 'owner',
   async: async (m, { client }) => {
      try {
         client.sendReact(m.chat, '🕒', m.key)

         await execPromise('git fetch')

         let { stdout: logOutput } = await execPromise('git log HEAD..FETCH_HEAD --stat')

         if (!logOutput || logOutput.trim() === '') {
            return client.reply(m.chat, '✅ Repository is already up to date. There are no pending updates to pull.', m)
         }

         logOutput = censorTextEmail(logOutput)

         const message = `🚩 *PENDING UPDATES*\n\n${logOutput.trim()}`

         client.reply(m.chat, message, m)
      } catch (e) {
         const errorMessage = e.stderr || e.stdout || e.message || String(e)
         client.reply(m.chat, `❌ Failed to check pending updates:\n\n${errorMessage}`, m)
      }
   },
   owner: true
}]

function censorTextEmail(text) {
   return text.replace(/\b([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/g, (match, local, domain) => {
      let cLocal = local.length <= 2 ? `${local[0]}***` : `${local.slice(0, 2)}***${local.slice(-1)}`

      let dIndex = domain.indexOf('.')
      let dName = domain.slice(0, dIndex)
      let dExt = domain.slice(dIndex)

      let cDomain = dName.length <= 2 ? `${dName[0]}***` : `${dName.slice(0, 1)}***${dName.slice(-1)}`

      return `${cLocal}@${cDomain}${dExt}`
   })
}