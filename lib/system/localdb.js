const fs = require('fs')

module.exports = class LocalDB {
   constructor(db) {
      this.file = db || 'database'
   }

   fetch = async () => {
      if (!fs.existsSync(`./${this.file}.json`)) return ({})
      const json = JSON.parse(fs.readFileSync(`./${this.file}.json`, 'utf-8'))
      return json
   }

   save = async data => {
      const database = data ? data : global.db
      fs.writeFileSync(`./${this.file}.json`, JSON.stringify(database, null, 3))
      fs.writeFileSync(`./${this.file}.bak`, JSON.stringify(database, null, 3))
   }
}