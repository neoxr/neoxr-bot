export const run = {
   usage: ['google', 'goimg'],
   use: 'query',
   category: 'utilities',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      Utils
   }) => {
      try {
         if (!text) return client.reply(m.chat, Utils.example(isPrefix, command, 'cat'), m)
         client.sendReact(m.chat, '🕒', m.key)
         if (command == 'google') {
            const json = await Api.neoxr('/google', {
               q: text
            })
            if (!json.status) return client.reply(m.chat, global.status.fail, m)
            let teks = `乂  *G O O G L E - S E A R C H*\n\n`
            json.data.map((v, i) => {
               teks += '*' + (i + 1) + '. ' + v.title + '*\n'
               teks += '	◦  *Snippet* : ' + v.description + '\n'
               teks += '	◦  *Link* : ' + v.url + '\n\n'
            })
            client.reply(m.chat, teks + global.footer, m)
         } else if (command == 'goimg') {
            const json = await Api.neoxr('/goimg', {
               q: text
            })
            if (!json.status) return client.reply(m.chat, global.status.fail, m)
            for (let i = 0; i < 5; i++) {
               const index = Math.floor(json.data.length * Math.random())
               const url = json.data[index].url
               const fn = await Utils.getFile(url)
               if (!fn?.status || (fn?.status && !/image\/(png|jpe?g)/i.test(fn.mime))) continue
               let caption = `乂  *G O O G L E - I M A G E*\n\n`
               caption += `	◦ *Title* : ${json.data[index].origin.title}\n`
               caption += `	◦ *Dimensions* : ${json.data[index].width} × ${json.data[index].height}\n\n`
               caption += global.footer
               client.sendFile(m.chat, url, '', caption, m)
               await Utils.delay(2500)
            }
         }
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   restrict: true,
   limit: true
}