export const run = {
   usage: ['runtime'],
   hidden: ['run'],
   category: 'miscs',
   async: async (m, {
      client,
      Utils
   }) => {
      try {
         let _uptime = process.uptime() * 1000
         let uptime = Utils.toTime(_uptime)
         client.reply(m.chat, Utils.texted('bold', `Running for : [ ${uptime} ] (${Utils.toDate(_uptime)})`), m)

      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false
}
