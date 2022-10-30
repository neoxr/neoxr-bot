exports.run = {
   usage: ['sholat'],
   hidden: ['solat'],
   use: 'city',
   category: 'utilities',
   async: async (m, {
      client,
      text,
      isPrefix,
      command
   }) => {
      try {
         if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'bandung'), m)
         client.sendReact(m.chat, '🕒', m.key)
         let json = await Api.sholat(text)
         if (!json.status) return client.reply(m.chat, global.status.fail, m)
         let teks = '乂  *S H O L A T*\n\n'
         teks += `“Displays prayer times for the *${Func.ucword(json.city)}* area as of *${json.date}.*”\n\n`
         teks += '	◦  ```Imsak  :``` ' + json.data.imsak + '\n'
         teks += '	◦  ```Subuh  :``` ' + json.data.subuh + '\n'
         teks += '	◦  ```Dhuha  :``` ' + json.data.dhuha + '\n'
         teks += '	◦  ```Dzuhur :``` ' + json.data.dzuhur + '\n'
         teks += '	◦  ```Ashar  :``` ' + json.data.ashar + '\n'
         teks += '	◦  ```Magrib :``` ' + json.data.magrib + '\n'
         teks += '	◦  ```Isya   :``` ' + json.data.isya + '\n\n'
         teks += global.footer
         client.sendMessageModify(m.chat, teks, m, {
            largeThumb: true,
            thumbnail: await Func.fetchBuffer('https://telegra.ph/file/7f16d028627d675791d68.jpg')
         })
      } catch {
         return client.reply(m.chat, global.status.error, m)
      }
   },
   error: false
}