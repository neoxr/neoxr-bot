const fs = require('fs')
const stable = require('json-stable-stringify')

module.exports = class LocalDB {
   constructor(db) {
      this.file = db || 'database'
   }

   fetch = async () => {
      try {
         if (!fs.existsSync(`./${this.file}.json`)) return ({})
         const json = JSON.parse(fs.readFileSync(`./${this.file}.json`, 'utf-8'))
         return json || {}
      } catch (e) {
         return {}
      }
   }

   save = async data => {
      try {
         const database = data ? data : global.db
         const streamJson = fs.createWriteStream(`./${this.file}.json`, {
            flags: 'w'
         })
         streamJson.write(stable(database))
         const streamBak = fs.createWriteStream(`./${this.file}.bak`, {
            flags: 'w'
         })
         streamBak.write(stable(database))
      } catch (e) {}
   }
}