module.exports = class Init {
   isType = (val, type) => {
      switch (type) {
         case 'number': return typeof val === 'number' && !isNaN(val)
         case 'string': return typeof val === 'string'
         case 'object': return val !== null && typeof val === 'object' && !Array.isArray(val)
         case 'boolean': return typeof val === 'boolean'
         default: return false
      }
   }

   execute = (prefix, template, custom = {}) => {
      const keys = Object.keys(template)
      for (let i = 0; i < keys.length; i++) {
         const key = keys[i]
         const defaultValue = template[key]
         const type = typeof defaultValue
         if (!(key in prefix) || !this.isType(prefix[key], type)) {
            prefix[key] = defaultValue
         }
      }
      for (const key in custom) {
         if (!(key in prefix)) {
            prefix[key] = custom[key]
         }
      }
   }
}