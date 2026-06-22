import { exec } from 'child_process'
import util from 'util'

const execPromise = util.promisify(exec)

export const run = {
   usage: ['update'],
   hidden: ['up'],
   category: 'owner',
   async: async (m, {
      client,
      Utils
   }) => {
      try {
         client.sendReact(m.chat, '🕒', m.key)

         const { stdout } = await execPromise('git pull')

         if (stdout.includes('Already up to date')) {
            return client.reply(m.chat, Utils.texted('bold', `✅ ${stdout.trim()}`), m)
         }

         client.reply(m.chat, `✅ Update successful:\n\n${stdout.trim()}`, m)
      } catch (e) {
         const errorMessage = e.stderr || e.stdout || e.message || String(e)

         if (errorMessage.includes('stash') || errorMessage.includes('Please commit your changes')) {
            try {
               const { stdout: stashOutput } = await execPromise('git stash && git pull')

               client.reply(m.chat, `✅ Force update successful (Stash):\n\n${stashOutput.trim()}`, m)
            } catch (stashErr) {
               const stashErrorMsg = stashErr.stderr || stashErr.message
               return client.reply(m.chat, `❌ Failed during stash & pull:\n\n${stashErrorMsg}`, m)
            }
         } else {
            return client.reply(m.chat, `❌ Failed to update:\n\n${errorMessage}`, m)
         }
      }
   },
   owner: true
}