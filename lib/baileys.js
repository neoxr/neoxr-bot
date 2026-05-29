import { Utils } from '@neoxr/wb'
import fs from 'node:fs'

export default (client, ctx) => {
   /**
    * Gets the name associated with a user's JID from the global database.
    * @param {string} jid - The JID (WhatsApp ID) of the user.
    * @returns {string|null} - The name of the user, or null if the user is not found.
    */
   client.getName = jid => {
      try {
         const data = global.db

         let name = null
         name = data.users.find(v =>
            v.jid === client.decodeJid(jid) || v.lid === client.decodeJid(jid)
         )?.name

         if (!name) {
            name = ctx.store.getName(jid)
         }

         return name
      } catch {
         return null
      }
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
         const picture = await client.profilePictureUrl(jid, 'image')
         return picture ?? defaults
      } catch (e) {
         return defaults
      }
   }

   /**
    * Resolves and validates a target WhatsApp JID from various input sources.
    * * The function extracts the target ID based on the following priority:
    * 1. Manual text input (LID, .net formatted, or raw phone numbers).
    * 2. The first mentioned user in the message (`m.mentionedJid`).
    * 3. The sender of a quoted message (`m.quoted.sender`).
    * * It validates the extracted ID by cross-referencing group participants, 
    * the local session store, and the global database. If the target cannot 
    * be resolved, it automatically sends an error warning to the chat.
    *
    * @param {Object} m - The message object containing chat context, mentions, and quoted data.
    * @param {string|number} [input] - Optional manual text input (e.g., phone number or LID).
    * @returns {string|null} - The validated target JID, or null if the target is missing or not found.
    */
   client.getJid = (m, input) => {
      try {
         const id = (input && String(input).endsWith('lid') ? input : null)
            || (input && /[.]net/.test(input) ? input : null)
            || (input && !String(input).startsWith('@') && !String(input).endsWith('.net') ? `${input}@s.whatsapp.net` : null)
            || m?.mentionedJid?.[0]
            || m?.quoted?.sender

         if (!id) {
            client.reply(m.chat, Utils.texted('bold', `🚩 Mention or Reply chat target.`), m)
            return null
         }

         let result = null

         if (m?.isGroup) {
            result = client.getJidFromParticipants(m.chat, id)?.id
         }

         if (!result) {
            result = ctx.store.getJidFromJSON(id)?.jid
         }

         if (!result) {
            const data = global.db
            const decodedId = client.decodeJid(id)
            result = data?.users?.find(v => v.jid === decodedId || v.lid === decodedId)?.jid || null
         }

         if (!result) {
            client.reply(m.chat, `❌ Cannot find JID in the system or database.`, m)
            return null
         }

         return result
      } catch (e) {
         return null
      }
   }
}