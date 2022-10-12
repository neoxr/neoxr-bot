exports.run = {
   usage: ['apk'],
   hidden: ['getapk'],
   use: 'query',
   category: 'downloader',
   async: async (m, {
      client,
      text,
      args,
      isPrefix,
      command
   }) => {
      try {
         if (command == 'apk') {
            if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'fb lite'), m)
            client.sendReact(m.chat, '🕒', m.key)
            let json = await Api.apk(text)
            if (!json.status) return client.reply(m.chat, global.status.fail, m)
            let rows = []
            json.data.map(async (v, i) => {
               rows.push({
                  title: v.name,
                  rowId: `${isPrefix}getapk ${text}—${v.no}`,
                  description: `[ ${v.size} | ${v.version} ]`
               })
            })
            client.sendList(m.chat, '', `Showing search results for : “${text}”, select below the application you want to download. 🍟`, '', 'Tap!', [{
               rows
            }], m)
         } else if (command == 'getapk') {
            if (!text) return client.reply(m.chat, global.status.invalid, m)
            let [query, no] = text.split`—`
            client.sendReact(m.chat, '🕒', m.key)
            let json = await Api.apk(query, no)  
            let teks = `乂  *P L A Y S T O R E*\n\n`
            teks += '	◦  *Name* : ' + json.data.name + '\n'
            teks += '	◦  *Version* : ' + json.data.version + '\n'
            teks += '	◦  *Size* : ' + json.file.size + '\n'
            teks += '	◦  *Category* : ' + json.data.category + '\n'
            teks += '	◦  *Developer* : ' + json.data.developer + '\n'
            teks += '	◦  *Requirement* : ' + json.data.requirement + '\n'
            teks += '	◦  *Publish* : ' + json.data.publish + '\n'
            teks += '	◦  *Link* : ' + json.data.playstore + '\n\n'
            teks += global.footer
            let chSize = Func.sizeLimit(json.file.size, global.max_upload)
            if (chSize.oversize) return client.reply(m.chat, `💀 File size (${json.file.size}) exceeds the maximum limit, download it by yourself via this link : ${await (await Func.shorten(json.file.url)).data.url}`, m)
            client.sendFile(m.chat, json.data.thumbnail, '', teks, m).then(() => {
               client.sendFile(m.chat, json.file.url, json.file.filename, '', m)
            })
         }
      } catch (e) {
         console.log(e)
         return client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   limit: true,
   restrict: true,
}