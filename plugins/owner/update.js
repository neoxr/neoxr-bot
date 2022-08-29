const { execSync } = require('child_process')
exports.run = {
   usage: ['update'],
   async: async (m, {
      client
   }) => {
      try {
         let stdout = execSync('git pull')
         let output = stdout.toString()
         if (output.match(new RegExp('Already up to date', 'g'))) return client.reply(m.chat, Func.texted('bold', `🚩 ${output.trim()}`), m)
         if (output.match(new RegExp('Please commit your changes or stash them before you merge', 'g'))) {
            let stdout = execSync('git stash && git pull')
            let output = stdout.toString()
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