const { execSync } = require('child_process')
const { Scandir } = require('system/extra')
const path = require('path')
exports.run = {
   usage: ['update'],
   async: async (m, {
      client
   }) => {
      try {
         let stdout = execSync('git pull')
         const output = stdout.toString()
         if (output.match(new RegExp('Already up to date', 'g'))) return client.reply(m.chat, Func.texted('bold', `🚩 ${output.trim()}`), m)
         client.reply(m.chat, `🚩 ${output.trim()}`, m).then(async () => {
            Scandir('plugins').then(files => {
               global.client.plugins = Object.fromEntries(files.filter(v => v.endsWith('.js')).map(file => [path.basename(file).replace('.js', ''), require(file)]))
            }).catch(e => console.error(e))
         })
      } catch (e) {
         return client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   owner: true,
   cache: true,
   location: __filename
}