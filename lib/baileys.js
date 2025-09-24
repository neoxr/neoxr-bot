import { Utils } from '@neoxr/wb'

export default client => {
   /**
    * Gets the name associated with a user's JID from the global database.
    * @param {string} jid - The JID (WhatsApp ID) of the user.
    * @returns {string|null} - The name of the user, or null if the user is not found.
    */
   client.getName = jid => {
      const isFound = global.db.users.find(v => v.jid === client.decodeJid(jid))
      if (!isFound) return null
      return isFound.name
   }

   /**
    * Get all admin and superadmin IDs from a group participants list.
    *
    * @param {Array} participants - Array of participant objects from the group metadata.
    * @returns {Array<string>} List of participant IDs who are admins or superadmins.
    */
   client.getAdmin = participants => participants
      ?.filter(i => i.admin === 'admin' || i.admin === 'superadmin')
      ?.map(i => i.id) || []
}