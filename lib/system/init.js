module.exports = class Init {
   /**
    * Function to initialize an object with values from a template and custom properties.
    * Ensures correct types based on the template using isType.
    * 
    * @param {Object} prefix - The object to be initialized or updated.
    * @param {Object} template - The template with default values and expected types.
    * @param {Object} [custom={}] - Optional custom properties to add if missing.
    */
   execute = (prefix, template, custom = {}) => {
      const validTemplate = Object.assign({}, template) // Salin template ke objek baru
      const validCustom = Object.assign({}, custom) // Salin custom ke objek baru

      // Gabungkan properti dari template ke prefix
      Object.keys(validTemplate).forEach(key => {
         if (!(key in prefix)) { // Jika properti tidak ada, tambahkan
            prefix[key] = validTemplate[key]
         }
      })

      // Tambahkan properti dari custom jika belum ada di prefix
      Object.keys(validCustom).forEach(key => {
         if (!(key in prefix)) { // Jika properti tidak ada di prefix, tambahkan
            prefix[key] = validCustom[key]
         }
      })
   }
}