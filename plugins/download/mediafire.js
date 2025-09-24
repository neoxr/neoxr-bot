import { decode } from 'html-entities'

export const run = {
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
      Config,
      Scraper,
      Utils
   }) => {
      try {
         if (!args || !args[0]) return client.reply(m.chat, Utils.example(isPrefix, command, 'https://www.mediafire.com/file/1fqjqg7e8e2v3ao/YOWA.v8.87_By.SamMods.apk/file'), m)
         if (!args[0].match(/(https:\/\/www.mediafire.com\/)/gi)) return client.reply(m.chat, global.status.invalid, m)
         client.sendReact(m.chat, '🕒', m.key)
         const json = await Api.neoxr('/mediafire', {
            url: args[0]
         })
         if (!json.status) return client.reply(m.chat, Utils.jsonFormat(json), m)
         let text = `乂  *M E D I A F I R E*\n\n`
         text += '	◦  *Name* : ' + unescape(decode(json.data.title)) + '\n'
         text += '	◦  *Size* : ' + json.data.size + '\n'
         text += '	◦  *Extension* : ' + json.data.extension + '\n'
         text += '	◦  *Mime* : ' + json.data.mime + '\n\n'
         text += global.footer
         const chSize = Utils.sizeLimit(json.data.size, users.premium ? Config.max_upload : Config.max_upload_free)
         const isOver = users.premium ? `💀 File size (${json.data.size}) exceeds the maximum limit.` : `⚠️ File size (${json.data.size}), you can only download files with a maximum size of ${Config.max_upload_free} MB and for premium users a maximum of ${Config.max_upload} MB.`
         if (chSize.oversize) return client.reply(m.chat, isOver, m)
         client.sendMessageModify(m.chat, text, m, {
            largeThumb: true,
            thumbnail: 'https://telegra.ph/file/fcf56d646aa059af84126.jpg'
         }).then(async () => {
            client.sendFile(m.chat, json.data.url, unescape(decode(json.data.title)), '', m)
         })
      } catch (e) {
         console.log(e)
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true
}