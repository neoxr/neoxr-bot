export const run = {
   usage: ['gempa'],
   category: 'utilities',
   async: async (m, {
      client,
      setting,
      limitter,
      Utils
   }) => {
      try {
         await client.sendReact(m.chat, '🕒', m.key)

         const json = await Api.neoxr('/gempa')
         if (!json.status) return client.reply(m.chat, `❌ ${json.msg || 'An error occurred while processing the data.'}`, m)

         const data = json.data
         let caption = `乂  *E A R T H Q U A K E*\n\n`
         caption += `   ◦  *Latitude* : ${data.lintang}\n`
         caption += `   ◦  *Longitude* : ${data.bujur}\n`
         caption += `   ◦  *Magnitude* : ${data.magnitudo}\n`
         caption += `   ◦  *Depth* : ${data.kedalaman}\n`
         caption += `   ◦  *Time* : ${data.waktu}\n`
         caption += `   ◦  *Location* : ${data.wilayah}\n\n`
         caption += global.footer

         const thumb = await Utils.fetchAsBuffer(data.map).catch(() => null)
         const icon = setting.icon ? (Utils.isUrl(setting.icon) ? setting.icon : Buffer.from(setting.icon, 'base64')) : null

         await client.sendMessageModify(m.chat, caption, m, {
            largeThumb: true,
            type: 'preview-link',
            ratio: 'square',
            thumbnail: thumb,
            icon
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
