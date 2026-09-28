export const run = {
   usage: ['mute'],
   use: '0 / 1',
   category: 'admin tools',
   async: async (m, {
      client,
      args,
      groupSet,
      Utils
   }) => {
      try {
         const [opt] = args || []
         if (!opt || !['0', '1'].includes(opt)) {
            return client.reply(m.chat, `❌ *Current status* : [ ${groupSet.mute ? 'True' : 'False'} ] (Enter *1* or *0*)`, m)
         }

         const status = opt === '1'
         const action = status ? 'muted' : 'unmuted'

         if (groupSet.mute === status) {
            return client.reply(m.chat, Utils.texted('bold', `❌ Previously ${action}.`), m)
         }

         groupSet.mute = status
         client.reply(m.chat, Utils.texted('bold', `✅ Successfully ${action}.`), m)
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   admin: true,
   group: true
}
