export const run = {
   usage: ['runtime'],
   hidden: ['run'],
   category: 'miscs',
   async: async (m, {
      client,
      Utils
   }) => {
      let _uptime = process.uptime() * 1000
      let uptime = Utils.toTime(_uptime)
      client.reply(m.chat, Utils.texted('bold', `Running for : [ ${uptime} ]`), m)
   },
   error: false
}