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
    * 
    * The `execute` function checks if the keys in the `prefix` object are missing or have an incorrect type compared to the template.
    * If a key is missing or has the wrong type, it is set to the default value from the `template`. Custom properties (passed as `custom`)
    * are added to the `prefix` if they don't already exist.
    * 
    * @param {Object} prefix - The object to be initialized. This object will be updated with values from the template and custom properties.
    * @param {Object} template - The template object containing default values. If a key in the `prefix` object is missing or has the wrong type, it will be updated from this template.
    * @param {Object} [custom={}] - Optional custom properties to be added to the object. These properties will be added to the `prefix` object only if they don't already exist.
    */
   execute = (prefix, template, custom = {}) => {
      // Iterate through the keys of the template object
      const keys = Object.keys(template)
      for (let i = 0; i < keys.length; i++) {
         const key = keys[i]
         const defaultValue = template[key]
         const type = typeof defaultValue

         // Check if the key is not present in prefix or has an incorrect type
         if (!(key in prefix) || !this.isType(prefix[key], type)) {
            // Set the value of the key to the default value from the template
            prefix[key] = defaultValue
         }
      }

      // Add custom properties to the prefix object
      for (const key in custom) {
         // If the key is not already in prefix, add the custom value
         if (!(key in prefix)) {
            prefix[key] = custom[key]
         }
      }
   }
}
