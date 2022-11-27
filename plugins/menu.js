exports.run = {
   hidden: ['menu', 'help', 'bot', 'm'],
   async: async (m, {
      client,
      isPrefix
   }) => {
      let cmd = Object.entries(client.plugins).filter(([_, obj]) => obj.run.usage)
      let commands = []
      cmd.map(([_, v]) => {
         switch (v.run.usage.constructor.name) {
            case 'Array':
               v.run.usage.map(x => commands.push({
                  usage: x,
                  use: v.run.use ? Func.texted('bold', v.run.use) : ''
               }))
               break
            case 'String':
               commands.push({
                  usage: v.run.usage,
                  use: v.run.use ? Func.texted('bold', v.run.use) : ''
               })
         }
      })
      const print = commands.sort((a, b) => a.usage.localeCompare(b.usage)).map(v => `◦  ${isPrefix + v.usage} ${v.use}`).join('\n')
      client.sendMessageModify(m.chat, print, m, {
         largeThumb: true,
      })
   },
   error: false
}