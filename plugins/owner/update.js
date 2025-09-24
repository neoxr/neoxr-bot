import { execSync } from 'child_process'

export const run = {
   usage: ['update'],
   category: 'owner',
   async: async (m, {
      client,
      Utils,
   }) => {
      try {
         var stdout = execSync('git pull')
         var output = stdout.toString()
         if (output.match(new RegExp('Already up to date', 'g'))) return client.reply(m.chat, Utils.texted('bold', `🚩 ${output.trim()}`), m)
         if (output.match(/stash/g)) {
            var stdout = execSync('git stash && git pull')
            var output = stdout.toString()
            client.reply(m.chat, `🚩 ${output.trim()}`, m).then(async () => process.send('reset'))
         } else return client.reply(m.chat, `🚩 ${output.trim()}`, m).then(async () => process.send('reset'))
      } catch (e) {
         return client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   owner: true
}