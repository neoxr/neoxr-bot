const { decode } = require('html-entities')
exports.run = {
   usage: ['mf', 'mediafire'],
   async: async (m, {
      client,
      args,
      isPrefix,
      command
   }) => {
      try {
         if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'https://www.mediafire.com/file/1fqjqg7e8e2v3ao/YOWA.v8.87_By.SamMods.apk/file'), m)
         if (!args[0].match(/(https:\/\/www.mediafire.com\/)/gi)) return client.reply(m.chat, global.status.invalid, m)
         client.sendReact(m.chat, '🕒', m.key)
         let json = await Api.mediafire(args[0])
         if (!json.status) return client.reply(m.chat, Func.jsonFormat(json), m)
         let text = '◦  *Name* : ' + unescape(decode(json.data.filename)) + '\n'
         text += '◦  *Size* : ' + json.data.size + '\n'
         text += '◦  *Extension* : ' + json.data.extension + '\n'
         text += '◦  *Mime* : ' + json.data.mime + '\n'
         text += '◦  *Uploaded* : ' + json.data.uploaded
         let chSize = Func.sizeLimit(json.data.size, global.max_upload)
         if (chSize.oversize) return client.reply(m.chat, `💀 File size (${json.data.size}) exceeds the maximum limit, download it by yourself via this link : ${await (await scrap.shorten(json.data.link)).data.url}`, m)
         client.reply(m.chat, text, m).then(async () => {
            client.sendFile(m.chat, json.data.link, unescape(decode(json.data.filename)), '', m)
         })
      } catch {
         return client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   limit: true,
   cache: true,
   location: __filename
}