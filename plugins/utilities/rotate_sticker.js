export const run = {
   usage: ['flip', 'flop'],
   use: 'reply sticker',
   category: 'utilities',
   async: async (m, {
      client,
      command,
      Utils,
      Scraper,
      limitter,
      setting
   }) => {
      try {
         if (!m.quoted) return client.reply(m.chat, Utils.texted('bold', `❌ Reply to sticker you want to ${command.toLowerCase()}.`), m)
         let q = m.quoted ? m.quoted : m
         let mime = (q.msg || q).mimetype || ''
         if (!/webp/.test(mime)) return client.reply(m.chat, Utils.texted('bold', `❌ Reply to sticker you want to ${command.toLowerCase()}.`), m)
         let buffer = await q.download()
         const file = await Scraper.uploadImageV2(buffer)
         if (!file.status) return m.reply(Utils.jsonFormat(file))
         client.sendReact(m.chat, '🕒', m.key)
         const json = await Api.neoxr(`/${command.toLowerCase()}`, {
            url: file.data.url
         })
         const result = await Utils.fetchAsBuffer(json.data.url)
         client.sendSticker(m.chat, result, m, {
            packname: setting.sk_pack,
            author: setting.sk_author
         })
         limitter()
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   limit: true
}