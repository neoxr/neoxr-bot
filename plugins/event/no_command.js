exports.run = {
   async: async (m, {
      client,
      body,
      setting,
      isOwner
   }) => {
      try {
         let cmd = global.client.commands != null ? Object.values(global.client.commands) : []
         let commands = Func.arrayJoin(Object.values(cmd).filter(v => v.run.usage).map(v => v.run.usage))
         let prefix = setting.multiprefix ? setting.prefix : [setting.onlyprefix]
         if (!isOwner && body && prefix.includes(body.charAt(0)) && !commands.includes(body.split` `[0].replace(body.charAt(0), '').trim())) return client.updateBlockStatus(m.sender, 'block')
      } catch (e) {
         return client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   private: true,
   cache: true,
   location: __filename
}