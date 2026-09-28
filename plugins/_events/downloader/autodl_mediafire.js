import { decode } from 'html-entities'

export const run = {
   regex: /^(?:https?:\/\/)?(?:www\.)?(?:mediafire\.com\/)(?:\S+)?$/i,
   async: async (m, {
      client,
      body,
      users,
      Config,
      setting,
      Utils,
      limitter
   }) => {
      try {
         const extract = body ? Utils.generateLink(body) : null
         if (!extract) return

         const regex = /mediafire\.com/i
         const links = extract.filter(v => regex.test(v))
         if (!links.length) return

         await client.sendReact(m.chat, '🕒', m.key)
         Utils.hitstat('mediafire', m.sender)

         for (const link of links) {
            const json = await Api.neoxr('/mediafire', {
               url: link
            })
            if (!json.status) return client.reply(m.chat, `❌ ${json.msg || 'An error occurred while processing the data.'}`, m)

            const filename = unescape(decode(json.data.title || ''))

            let caption = `◦  *Name* : ${filename}\n`
            caption += `◦  *Size* : ${json.data.size}\n`
            caption += `◦  *Extension* : ${json.data.extension}\n`
            caption += `◦  *Mime* : ${json.data.mime}`

            const chSize = Utils.sizeLimit(json.data.size, users.premium ? Config.max_upload : Config.max_upload_free)
            if (chSize.oversize) {
               const isOver = users.premium
                  ? `💀 File size (${json.data.size}) exceeds the maximum limit.`
                  : `⚠️ File size (${json.data.size}), you can only download files with a maximum size of ${Config.max_upload_free} MB and for premium users a maximum of ${Config.max_upload} MB.`
               return client.reply(m.chat, isOver, m)
            }

            client.sendFile(m.chat, json.data.url, filename, caption, m)
         }
         limitter()
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   limit: true,
   download: true
}
