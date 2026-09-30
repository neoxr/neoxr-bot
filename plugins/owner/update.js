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
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   owner: true
}