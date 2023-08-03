const { decode } = require('html-entities')
exports.run = {
   usage: ['mediafire'],
   hidden: ['mf'],
   use: 'link',
   category: 'downloader',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      users,
      env,
      Scraper,
      Func
   }) => {
      try {
         if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'https://www.mediafire.com/file/1fqjqg7e8e2v3ao/YOWA.v8.87_By.SamMods.apk/file'), m)
         if (!args[0].match(/(https:\/\/www.mediafire.com\/)/gi)) return client.reply(m.chat, global.status.invalid, m)
         client.sendReact(m.chat, '🕒', m.key)
         const json = await Api.neoxr('/mediafire', {
            url: args[0]
         })    
         if (!json.status) return client.reply(m.chat, Func.jsonFormat(json), m)
         let text = `乂  *M E D I A F I R E*\n\n`
         text += '	◦  *Name* : ' + unescape(decode(json.data.filename)) + '\n'
         text += '	◦  *Size* : ' + json.data.size + '\n'
         text += '	◦  *Extension* : ' + json.data.extension + '\n'
         text += '	◦  *Mime* : ' + json.data.mime + '\n'
         text += '	◦  *Uploaded* : ' + json.data.uploaded + '\n\n'
         text += global.footer
         const chSize = Func.sizeLimit(json.data.size, users.premium ? env.max_upload : env.max_upload_free)
         const isOver = users.premium ? `💀 File size (${json.data.size}) exceeds the maximum limit, download it by yourself via this link : ${await (await Scraper.shorten(json.data.link)).data.url}` : `⚠️ File size (${json.data.size}), you can only download files with a maximum size of ${env.max_upload_free} MB and for premium users a maximum of ${env.max_upload} MB.`
         if (chSize.oversize) return client.reply(m.chat, isOver, m)
         client.sendMessageModify(m.chat, text, m, {
            largeThumb: true,
            thumbnail: 'https://telegra.ph/file/fcf56d646aa059af84126.jpg'
         }).then(async () => {
            client.sendFile(m.chat, json.data.link, unescape(decode(json.data.filename)), '', m)
         })
      } catch (e) {
         console.log(e)
         client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true,
   cache: true,
   location: __filename
}