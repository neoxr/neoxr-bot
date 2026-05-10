export const run = {
   usage: ['gempa'],
   category: 'utilities',
   async: async (m, {
      client,
      Utils
   }) => {
      try {
         client.sendReact(m.chat, '🕒', m.key)
         let json = await Api.neoxr('/gempa')
         if (!json.status) return client.reply(m.chat, Utils.jsonFormat(json), m)
         let caption = `乂  *G E M P A*\n\n`
         caption += `	◦  *Lintang* : ${json.data.lintang}\n`
         caption += `	◦  *Bujur* : ${json.data.bujur}\n`
         caption += `	◦  *Skala* : ${json.data.magnitudo}\n`
         caption += `	◦  *Kedalaman* : ${json.data.kedalaman}\n`
         caption += `	◦  *Waktu* : ${json.data.waktu}\n`
         caption += `	◦  *Pusat Gempa* : ${json.data.wilayah}\n\n`
         caption += global.footer
         client.sendMessageModify(m.chat, caption, m, {
            largeThumb: true,
            type: 'preview-link',
            /* choose: landscape (default), potrait, square */
            ratio: 'square',
            thumbnail: await Utils.fetchAsBuffer(json.data.map)
         })
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false
}