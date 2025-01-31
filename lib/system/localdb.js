const fs = require('fs').promises

module.exports = class LocalDB {
   /**
    * Initializes the LocalDB instance with the provided file path.
    * @param {string} [filePath] - The path to the JSON file where the database will be stored. Defaults to 'database.json'.
    */
   constructor(filePath) {
      this.filePath = filePath ? filePath + '.json' : 'database'
      this.queue = []
      this.initDB()
   }

   /**
    * Initializes the database by checking if the file exists. 
    * If the file does not exist, it creates an empty JSON file.
    * @returns {Promise<void>}
    */
   initDB = async () => {
      try {
         await fs.access(this.filePath)
      } catch (err) {
         await this.save({})
      }
   }

   /**
    * Validates if the provided data is a valid JSON object.
    * @param {any} data - The data to be validated.
    * @returns {boolean} - Returns true if the data is valid JSON, otherwise false.
    */
   validateJSON = (data) => {
      try {
         JSON.stringify(data, null)
         return true
      } catch (err) {
         return false
      }
   }

   /**
    * Adds data to the internal queue to be saved later.
    * @param {object} data - The data to be added to the queue.
    */
   enqueue = data => this.queue.push(data)

   /**
    * Saves the valid data from the queue to the file.
    * If the data is valid JSON, it will be written to the file.
    * @param {object} data - The data to be saved to the file.
    * @returns {Promise<void>}
    */
   save = async data => {
      this.enqueue(data)

      // Filter out invalid data and keep only valid JSON data
      const validData = this.queue.filter(this.validateJSON)
      this.queue = []

      if (validData.length > 0) {
         try {
            await fs.writeFile(this.filePath, JSON.stringify(validData[0], null), 'utf8')
         } catch (err) {
            console.log(`Failed to save data: ${err.message}`)
         }
      } else {
         console.log('No valid data to save')
      }
   }

   /**
    * Fetches the data from the JSON file and returns it.
    * @returns {Promise<object|null>} - The parsed data from the file, or null if an error occurred.
    */
   fetch = async () => {
      try {
         const data = await fs.readFile(this.filePath, 'utf8')
         return JSON.parse(data)
      } catch (err) {
         console.log(`Failed to fetch data: ${err.message}`)
         return null
      }
   }
}