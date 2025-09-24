class Init {
   /**
    * Creates a deep clone of the provided object.
    * This is useful to avoid shared references between objects,
    * ensuring that modifications to the returned object do not affect the original.
    *
    * @function
    * @param {Object} [object={}] - The object to be deeply cloned.
    * @returns {Object} - A deep copy of the input object.
    */
   getModel = (object = {}) => JSON.parse(JSON.stringify(object))

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
         if (!(key in prefix)) {
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

export default new Init