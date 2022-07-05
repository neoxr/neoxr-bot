exports.run = {
   async: async (m, {
      client,
      body
   }) => {
      try {
         if (m.msg && m.msg.viewOnce) {
            let media = await client.downloadMediaMessage(m.msg)
            if (/image/.test(m.mtype)) {
               client.sendFile(m.chat, media, Func.filename('jpg'), body ? body : '', m)
            } else if (/video/.test(m.mtype)) {
               client.sendFile(m.chat, media, Func.filename('mp4'), body ? body : '', m)
            }
         }
      } catch (e) {
         console.log(e)
         // return client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   cache: true,
   location: __filename
}