exports.run = {
   usage: ['listonline'],
   hidden: ['here'],
   category: 'group',
   async: async (m, {
      client
   }) => {
      let online = [...Object.keys(store.presences[m.chat])]
      client.reply(m.chat, online.map(v => '◦  @' + v.replace(/@.+/, '')).join('\n'), m)
   },
   error: false,
   group: true
}