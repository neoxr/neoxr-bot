import fs from 'node:fs'

const bind = client => {
   /**
    * Gets the name associated with a user's JID from the global database.
    * @param {string} jid - The JID (WhatsApp ID) of the user.
    * @returns {string|null} - The name of the user, or null if the user is not found.
    */
   client.getName = jid => {
      try {
         const data = global.db

         let name = null
         name = data.users.get(client.decodeJid(jid))?.name

         return name
      } catch {
         return null
      }
   }

   /**
    * Fetches the profile picture of a given WhatsApp JID.
    *
    * If the user has no profile picture or if an error occurs while fetching it,
    * the function will return a default image instead.
    *
    * @param {string} jid - The WhatsApp JID (user identifier) whose profile picture is requested.
    * @returns {Promise<string|Buffer>} - A URL of the profile picture if available, 
    *                                     otherwise the default image as a Buffer.
    */
   client.profilePicture = async jid => {
      const defaults = fs.readFileSync('./media/image/default.jpg')
      try {
         const picture = await client.profile.getProfilePicture(jid, 'image')
         return picture?.url ?? defaults
      } catch (e) {
         return defaults
      }
   }
}

export { bind }
export default { bind }