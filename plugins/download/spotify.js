exports.run = {
   usage: ['spotify'],
   use: 'link',
   category: 'downloader',
   async: async (m, {
      client,
      args,
      isPrefix,
      command
   }) => {
      try {
         if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'https://open.spotify.com/track/6cHCixTkEFATjcu5ig8a7I'), m)
         client.sendReact(m.chat, '🕒', m.key)
         var json = await Api.spotify(args[0])
         if (!json.status) return client.reply(m.chat, Func.jsonFormat(json), m)
         if (/track/.test(args[0])) {
            let caption = `乂  *S P O T I F Y*\n\n`
            caption += `	◦  *Title* : ${json.data.title}\n`
            caption += `	◦  *Artist* : ${json.data.artist.name}\n`
            caption += `	◦  *Duration* : ${json.data.duration}\n`
            caption += `	◦  *Source* : ${args[0]}\n\n`
            caption += global.footer
            client.sendMessageModify(m.chat, caption, m, {
               largeThumb: true,
               thumbnail: await Func.fetchBuffer(json.data.thumbnail)
            }).then(async () => {
               client.sendFile(m.chat, json.data.url, json.data.title + '.mp3', '', m, {
                  document: true,
                  APIC: await Func.fetchBuffer(json.data.thumbnail)
               })
            })
         } else if (/playlist/.test(args[0])) {
            let rows = []
            json.tracks.map(v => rows.push({
               title: v.title,
               rowId: `${isPrefix + command} ${v.url}`,
               description: `Artists : ${v.artists} – Album : ${v.album}`
            }))
            client.sendList(m.chat, '', `Showing track list from playlist : “${json.data.title}” 🍟`, '', 'Tap!', [{
               rows
            }], m)
         } else return m.reply(global.status.invalid)
      } catch (e) {
         console.log(e)
         return client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   limit: true,
   cache: true,
   location: __filename
}