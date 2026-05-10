import { decode } from 'html-entities'

export const run = {
   regex: /^(?:https?:\/\/)?(?:www\.)?(?:mediafire\.com\/)(?:\S+)?$/,
   async: async (m, {
      client,
      body,
      users,
      Config,
      Utils
   }) => {
      try {
         const regex = /^(?:https?:\/\/)?(?:www\.)?(?:mediafire\.com\/)(?:\S+)?$/;
         const extract = body ? Utils.generateLink(body) : null
         if (extract) {
            const links = extract.filter(v => v.match(regex))
            if (links.length != 0) {
               if (users.limit > 0) {
                  let limit = 1
                  if (users.limit >= limit) {
                     users.limit -= limit
                  } else return client.reply(m.chat, Utils.texted('bold', `🚩 Your limit is not enough to use this feature.`), m)
               }
               client.sendReact(m.chat, '🕒', m.key)
               let old = new Date()
               Utils.hitstat('mediafire', m.sender)
               links.map(async link => {
                  const json = await Api.neoxr('/mediafire', {
                     url: link
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
                     type: 'preview-link',
                     /* choose: landscape (default), potrait, square */
                     ratio: 'landscape',
                     thumbnail: 'https://telegra.ph/file/fcf56d646aa059af84126.jpg'
                  }).then(async () => {
                     client.sendFile(m.chat, json.data.url, unescape(decode(json.data.title)), '', m)
                  })
               })
            }
         }
      } catch (e) {
         return client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   limit: true,
   download: true
}