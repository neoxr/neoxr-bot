module.exports = class Init {
   /**
    * Function to check if the value is of the specified type.
    * @param {any} val - The value whose type is to be checked.
    * @param {string} type - The type that is being checked for ('number', 'string', 'object', 'boolean').
    * @returns {boolean} - Returns true if the type of the value matches the expected type, otherwise false.
    * 
    * - 'number' checks for a number (excluding NaN).
    * - 'string' checks for a string.
    * - 'object' checks for an object (excluding arrays).
    * - 'boolean' checks for a boolean.
    */
   isType = (val, type) => {
      switch (type) {
         case 'number': return typeof val === 'number' && !isNaN(val)
         case 'string': return typeof val === 'string'
         case 'object': return val !== null && typeof val === 'object' && !Array.isArray(val)
         case 'boolean': return typeof val === 'boolean'
         default: return false
      }
   }

   /**
    * Function to initialize an object with values from a template and custom properties.
    * Ensures correct types based on the template using isType.
    * 
    * @param {Object} prefix - The object to be initialized or updated.
    * @param {Object} template - The template with default values and expected types.
    * @param {Object} [custom={}] - Optional custom properties to add if missing.
    */
   execute = (prefix, template, custom = {}) => {
      const validTemplate = Object.assign({}, template)
      const validCustom = Object.assign({}, custom)

      Object.keys(validTemplate).forEach(key => {
         const expectedType = typeof validTemplate[key]
         const currentVal = prefix[key]

         // If key does not exist or type mismatched, assign default value
         if (!(key in prefix) || !this.isType(currentVal, expectedType)) {
            prefix[key] = validTemplate[key]
         }
      })

      Object.keys(validCustom).forEach(key => {
         if (!(key in prefix)) {
            prefix[key] = validCustom[key]
         }
      })
   }
}