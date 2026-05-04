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
   getModel = (object) => {
      if (object === undefined) return undefined
      if (object === null) return null
      return JSON.parse(JSON.stringify(object))
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
      const merge = (target, source) => {
         Object.keys(source).forEach(key => {
            const val = source[key]

            if (!(key in target)) {
               target[key] = (val !== null && typeof val === 'object')
                  ? JSON.parse(JSON.stringify(val))
                  : val

            } else if (
               val !== null && typeof val === 'object' && !Array.isArray(val) &&
               target[key] !== null && typeof target[key] === 'object' && !Array.isArray(target[key])
            ) {
               merge(target[key], val)
            }
         })
      }

      merge(prefix, template)
      merge(prefix, custom)
   }
}

export default new Init