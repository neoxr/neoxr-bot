const { decode } = require('html-entities')
exports.run = {
   regex: /^(?:https?:\/\/)?(?:www\.)?(?:mediafire\.com\/)(?:\S+)?$/,
   async: async (m, {
      client,
      body,
      users,
      setting
   }) => {
      try {
         const regex = /^(?:https?:\/\/)?(?:www\.)?(?:mediafire\.com\/)(?:\S+)?$/;
         const extract = body ? Func.generateLink(body) : null
         if (extract) {
            const links = extract.filter(v => v.match(regex))
            if (links.length != 0) {
               client.reply(m.chat, global.status.getdata, m)
               let old = new Date()
               Func.hitstat('mediafire', m.sender)
               links.map(async link => {
                  let json = await Api.mediafire(link)
                  if (!json.status) return client.reply(m.chat, Func.jsonFormat(json), m)
                  let text = '乂  *M E D I A F I R E*\n\n'
                  text += '	◦  *Name* : ' + unescape(decode(json.data.filename)) + '\n'
                  text += '	◦  *Size* : ' + json.data.size + '\n'
                  text += '	◦  *Extension* : ' + json.data.extension + '\n'
                  text += '	◦  *Mime* : ' + json.data.mime + '\n'
                  text += '	◦  *Uploaded* : ' + json.data.uploaded + '\n\n'
                  text += global.db.setting.footer
                  let chSize = Func.sizeLimit(json.data.size, global.max_upload)
                  if (chSize.oversize) return client.reply(m.chat, `💀 File size (${json.data.size})  exceeds the maximum limit, download it by yourself via this link : ${await (await scrap.shorten(json.data.link)).data.url}`, m)
                  client.fakeStory(m.chat, text, global.db.setting.header).then(async () => {
                     client.sendFile(m.chat, json.data.link, unescape(decode(json.data.filename)), '', m)
                  })
               })
            }
         }
      } catch (e) {
         return client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   download: true
}