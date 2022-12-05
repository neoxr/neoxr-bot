const fs = require('fs')

/* Fake Reply Location
 * @param {String} jid
 * @param {String} text
 * @param {String} caption
 */
client.fakeLoc = async (jid, text, caption) => {
   const location = {
      key: {
         fromMe: false,
         participant: `0@s.whatsapp.net`,
         ...(jid ? {
            remoteJid: 'status@broadcast'
         } : {})
      },
      message: {
         "imageMessage": {
            "mimetype": "image/jpeg",
            "caption": caption,
            "jpegThumbnail": await Func.createThumb(await fs.readFileSync(`./media/image/thumb.jpg`))
         }
      }
   }
   await client.sendPresenceUpdate('composing', jid)
   return client.reply(jid, text, location)
}

/* Fake Reply Voicenote
 * @param {String} jid
 * @param {String} text
 */
client.fakeVN = async (jid, text) => {
   const voicenote = {
      key: {
         participant: `0@s.whatsapp.net`,
         ...(m.chat ? {
            remoteJid: "status@broadcast"
         } : {})
      },
      message: {
         "audioMessage": {
            "mimetype": "audio/ogg; codecs=opus",
            "seconds": 359996400,
            "ptt": "true"
         }
      }
   }
   await client.sendPresenceUpdate('composing', jid)
   return client.reply(jid, text, voicenote)
}

// You can add baileys messaging functionality here . . . 