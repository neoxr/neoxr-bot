const { Component } = require('@neoxr/wb')
const { Function: Func } = new Component
const mime = require('mime-types').lookup

module.exports = client => {
   /**
    * Sends a document with optional customization such as caption, file name, mime type, etc.
    * @param {string} jid - The recipient's JID (WhatsApp ID).
    * @param {string} text - The caption or text to include with the document.
    * @param {object} [quoted] - The message being replied to (optional).
    * @param {object} [opts] - Optional settings for document customization.
    * @param {string} [opts.mime] - The mime type of the document (optional).
    * @param {number} [opts.pages] - The number of pages in the document (optional).
    * @param {string} [opts.thumbnail] - URL for the thumbnail image (optional).
    * @param {string} [opts.fname] - The file name to be used for the document (optional).
    * @param {number} [opts.fsize] - The file size of the document in bytes (optional).
    * @returns {Promise} - A promise that resolves once the document has been sent.
    */
   client.sendFDoc = async (jid, text, quoted, opts = {}) => {
      // Send presence update indicating that the bot is composing a message
      await client.sendPresenceUpdate('composing', jid)

      return client.sendMessage(jid, {
         document: {
            url: 'https://iili.io/His5lBp.jpg'
         },
         url: 'https://mmg.whatsapp.net/v/t62.7119-24/31158881_1025772512163769_7208897168054919032_n.enc?ccb=11-4&oh=01_AdSBWokZF7M6H3NCfmTx08kHU3Dqw8rhlYlgUfXP6sACIg&oe=64CC069E&mms3=true',
         mimetype: (opts && opts.mime) ? mime(opts.mime) : mime('ppt'),
         fileSha256: 'dxsumNsT8faD6vN91lNkqSl60yZ5MBlH9L6mjD5iUkQ=',
         pageCount: (opts && opts.pages) ? Number(opts.pages) : 25,
         fileEncSha256: 'QGPsr3DQgnOdGpfcxDLFkzV2kXAaQmgTV8mYDzwrev4=',
         jpegThumbnail: (opts && opts.thumbnail) ? await Func.createThumb(opts.thumbnail) : await Func.createThumb('https://iili.io/HisdzgI.jpg'),
         fileName: (opts && opts.fname) ? opts.fname : 'ɴᴇᴏxʀ ʙᴏᴛ',
         fileLength: (opts && opts.fsize) ? Number(opts.fsize) : 1000000000000,
         caption: text,
         mediaKey: 'u4PCBMBCnVT0s1M8yl8/AZYmeK8oOBAh/fnnVPujcgw=',
      }, {
         quoted
      })
   }

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
}