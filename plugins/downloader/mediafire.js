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
      Utils,
      limitter
   }) => {
      try {
         const [url] = args || []
         if (!url) return client.reply(m.chat, Utils.example(isPrefix, command, 'https://www.mediafire.com/file/1fqjqg7e8e2v3ao/YOWA.v8.87_By.SamMods.apk/file'), m)
         if (!/mediafire\.com/i.test(url)) return client.reply(m.chat, global.status.invalid, m)

         await client.sendReact(m.chat, '🕒', m.key)
         const json = await Api.neoxr('/mediafire', { url })
         if (!json.status) return client.reply(m.chat, `❌ ${json.msg || 'An error occurred while processing the data.'}`, m)

         const filename = unescape(decode(json.data.title))
         let caption = `◦ *Name* : ${filename}\n`
         caption += `◦ *Size* : ${json.data.size}\n`
         caption += `◦ *Extension* : ${json.data.extension}\n`
         caption += `◦ *Mime* : ${json.data.mime}`

         const chSize = Utils.sizeLimit(json.data.size, users.premium ? Config.max_upload : Config.max_upload_free)
         if (chSize.oversize) {
            const isOver = users.premium
               ? `💀 File size (${json.data.size}) exceeds the maximum limit.`
               : `⚠️ File size (${json.data.size}), you can only download files with a maximum size of ${Config.max_upload_free} MB and for premium users a maximum of ${Config.max_upload} MB.`
            return client.reply(m.chat, isOver, m)
         }

         client.sendFile(m.chat, json.data.url, filename, caption, m)
         limitter()
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   limit: true
}
