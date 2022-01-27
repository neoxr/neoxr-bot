exports.run = {
   usage: ['backup', 'save'],
   async: async (m, {
      client,
      command
   }) => {
      try {
         await global.save
         let file = await Func.fetchBuffer('./database.json')
         client.reply(m.chat, global.status.wait, m)
         let backup = await Func.backupDatabase(file)
         if (!backup.status) return client.sendDocument(m.chat, file, 'database.json', m)
         client.reply(m.chat, `Uploaded into server as ( *./${backup.result.name}* )\nLocation : ${await (await Func.shorten4(backup.result.link)).data.url}`, m)
      } catch {
         return client.reply(m.chat, global.status.error, m)
      }
   },
   owner: true,
   cache: true,
   location: __filename
}