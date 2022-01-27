exports.run = {
   usage: ['adminlist', 'listadmin'],
   async: async (m, {
      client,
      text
   }) => {
      try {
         let admin = await client.groupAdmin(m.chat)
         let message = (!text) ? 'Hi admin ' + await (await client.groupMetadata(m.chat)).subject + ' group.' : text
         client.fakeStory(m.chat, `❏  *A D M I N S*\n\n*“${message}”*\n${readmore}\n${admin.map(v => '	◦  @' + v.replace(/@.+/, '')).join('\n')}\n\n${global.setting.footer}`, global.setting.header)
      } catch {
         return client.reply(m.chat, global.status.error, m)
      }
   },
   group: true
}

let readmore = String.fromCharCode(8206).repeat(4001)