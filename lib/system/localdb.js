const fs = require('fs').promises

module.exports = class LocalDB {
   constructor(filePath) {
      this.filePath = filePath ? filePath + '.json' : 'database'
      this.queue = []
      this.initDB()
   }

   initDB = async () => {
      try {
         await fs.access(this.filePath)
      } catch (err) {
         await this.save({})
      }
   }

   validateJSON = (data) => {
      try {
         JSON.stringify(data, null)
         return true
      } catch (err) {
         return false
      }
   }

   enqueue = data => this.queue.push(data)

   save = async data => {
      this.enqueue(data)

      const validData = this.queue.filter(this.validateJSON)
      this.queue = []

      if (validData.length > 0) {
         try {
            await fs.writeFile(this.filePath, JSON.stringify(validData[0], null), 'utf8')
         } catch (err) {
            console.log(`Failed to save data: ${err.message}`)
         }
      } else {
         console.log('No valid data to save');
      }
   }

   fetch = async () => {
      try {
         const data = await fs.readFile(this.filePath, 'utf8')
         return JSON.parse(data)
      } catch (err) {
         console.log(`Failed to fetch data: ${err.message}`)
      }
   }
}