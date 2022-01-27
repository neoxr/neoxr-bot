exports.run = {
   usage: ['otagall', 'oeveryone'],
   async: async (m, {
      client,
      text,
      participants
   }) => {
      try {
         let member = participants.map(v => v.id)
         let message = (!text) ? 'Hello everyone, owner mention you in ' + await (await client.groupMetadata(m.chat)).subject + ' group.' : text
         client.fakeStory(m.chat, `❏  *E V E R Y O N E*\n\n*“${message}”*\n${readmore}\n${member.map(v => '	◦  @' + v.replace(/@.+/, '')).join('\n')}\n\n${global.setting.footer}`, global.setting.header)
      } catch (e) {
         console.log(e)
         return client.reply(m.chat, global.status.error, m)
      }
   },
   owner: true,
   group: true
}

let readmore = String.fromCharCode(8206).repeat(4001)