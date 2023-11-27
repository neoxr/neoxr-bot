exports.run = {
   usage: ['mute'],
   use: '0 / 1',
   category: 'admin tools',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      Func
   }) => {
      let gc = global.db.groups.find(v => v.jid == m.chat)
      let opt = [0, 1]
      if (!args || !args[0] || !opt.includes(parseInt(args[0]))) return client.reply(m.chat, `🚩 *Current status* : [ ${gc.mute ? 'True' : 'False'} ] (Enter *1* or *0*)`, m)
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
   admin: true,
   group: true,
   cache: true,
   location: __filename
}