exports.run = {
   usage: ['omute'],
   use: '0 / 1',
   category: 'owner',
   async: async (m, {
      client,
      args,
      isPrefix,
      command
   }) => {
      let gc = global.db.groups[m.chat]
      let opt = [0, 1]
      let rows = [{
         title: 'True',
         rowId: `${isPrefix + command} 1`,
         description: ``
      }, {
         title: 'False',
         rowId: `${isPrefix + command} 0`,
         description: ``
      }]
      if (!args || !args[0] || !opt.includes(parseInt(args[0]))) return client.sendList(m.chat, '', `🚩 *Current status* : [ ${gc.mute ? 'True' : 'False'} ]`, '', 'Tap!', [{ rows }], m)
      if (parseInt(args[0]) == 1) {
         if (gc.mute) return client.reply(m.chat, Func.texted('bold', `🚩 Previously muted.`), m)
         gc.mute = true
         client.reply(m.chat, Func.texted('bold', `🚩 Successfully muted.`), m)
      } else if (parseInt(args[0]) == 0) {
         if (!gc.mute) return client.reply(m.chat, Func.texted('bold', `🚩 Previously unmuted.`), m)
         gc.mute = false
         client.reply(m.chat, Func.texted('bold', `🚩 Successfully unmuted.`), m)
      }
   },
   owner: true,
   group: true,
   cache: true,
   location: __filename
}