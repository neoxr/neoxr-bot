exports.run = {
   usage: ['runtime'],
   hidden: ['run'],
   category: 'miscs',
   async: async (m, {
      client,
      Func
   }) => {
      let _uptime = process.uptime() * 1000
      let uptime = Func.toTime(_uptime)
      client.reply(m.chat, Func.texted('bold', `Running for : [ ${uptime} ]`), m)
   },
   error: false
}