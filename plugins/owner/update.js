const { execSync } = require('child_process')
exports.run = {
   usage: ['update'],
   hidden: ['upt'],
   category: 'owner',
   async: async (m, {
      client
   }) => {
      try {
         var stdout = execSync('git pull')
         var output = stdout.toString()
         if (output.match(new RegExp('Already up to date', 'g'))) return client.reply(m.chat, Func.texted('bold', `🚩 ${output.trim()}`), m)
         if (output.match(/stash/g)) {
            var stdout = execSync('git stash && git pull')
            var output = stdout.toString()
            client.reply(m.chat, `🚩 ${output.trim()}`, m).then(async () => {
               await props.save()
               process.send('reset')
            })
         } else return client.reply(m.chat, `🚩 ${output.trim()}`, m).then(async () => {
            await props.save()
            process.send('reset')
         })
      } catch (e) {
         return client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   owner: true,
   cache: true,
   location: __filename
}