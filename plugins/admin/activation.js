export const run = {
   usage: ['mute'],
   use: '0 / 1',
   category: 'admin tools',
   async: async (m, {
      client,
      args,
      Utils
   }) => {
      try {
         const [argumen] = args
         let gc = global.db.groups.find(v => v.jid == m.chat)
         let opt = [0, 1]
         if (!args || !argumen || !opt.includes(parseInt(argumen))) return client.reply(m.chat, `❌ *Current status* : [ ${gc.mute ? 'True' : 'False'} ] (Enter *1* or *0*)`, m)
         if (parseInt(argumen) == 1) {
            if (gc.mute) return client.reply(m.chat, Utils.texted('bold', `❌ Previously muted.`), m)
            gc.mute = true
            client.reply(m.chat, Utils.texted('bold', `✅ Successfully muted.`), m)
         } else if (parseInt(argumen) == 0) {
            if (!gc.mute) return client.reply(m.chat, Utils.texted('bold', `❌ Previously unmuted.`), m)
            gc.mute = false
            client.reply(m.chat, Utils.texted('bold', `✅ Successfully unmuted.`), m)
         }

      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   admin: true,
   group: true
}