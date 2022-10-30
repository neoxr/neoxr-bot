exports.run = {
   usage: ['menu', 'help', 'bot'],
   hidden: ['menutype'],
   async: async (m, {
      client,
      text,
      isPrefix
   }) => {
      try {
         const style = global.db.setting.menuStyle
         if (style == 1) {
            if (text) {
               let cmd = Object.entries(client.plugins).filter(([_, v]) => v.run.usage && v.run.category == text.toLowerCase())
               let usage = Object.keys(Object.fromEntries(cmd))
               if (usage.length == 0) return client.reply(m.chat, Func.texted('bold', `🚩 Category not available.`), m)
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
               return m.reply(print)
            } else {
               let filter = Object.entries(client.plugins).filter(([_, obj]) => obj.run.usage)
               let cmd = Object.fromEntries(filter)
               let category = []
               for (let name in cmd) {
                  let obj = cmd[name].run
                  if (!cmd) continue
                  if (!obj.category) continue
                  if (Object.keys(category).includes(obj.category)) category[obj.category].push(obj)
                  else {
                     category[obj.category] = []
                     category[obj.category].push(obj)
                  }
               }
               let rows = []
               const keys = Object.keys(category).sort()
               for (let k of keys) {
                  rows.push({
                     title: k.toUpperCase(),
                     rowId: `${isPrefix}menutype ${k}`,
                     description: ``
                  })
               }
               await client.sendList(m.chat, '', global.db.setting.msg.replace('+tag', `@${m.sender.replace(/@.+/g, '')}`).replace('+name', m.pushName).replace('+greeting', Func.greeting()), global.botname, 'Tap!', [{
                  rows
               }], m)
            }
         } else if (style == 2) {
            let filter = Object.entries(client.plugins).filter(([_, obj]) => obj.run.usage)
            let cmd = Object.fromEntries(filter)
            let category = []
            for (let name in cmd) {
               let obj = cmd[name].run
               if (!cmd) continue
               if (!obj.category) continue
               if (Object.keys(category).includes(obj.category)) category[obj.category].push(obj)
               else {
                  category[obj.category] = []
                  category[obj.category].push(obj)
               }
            }
            const keys = Object.keys(category).sort()
            let print = global.db.setting.msg.replace('+tag', `@${m.sender.replace(/@.+/g, '')}`).replace('+name', m.pushName).replace('+greeting', Func.greeting())
            print += '\n' + String.fromCharCode(8206).repeat(4001)
            for (let k of keys) {
               print += '\n\n乂  *' + k.toUpperCase().split('').map(v => v).join(' ') + '*\n\n'
               let cmd = Object.entries(client.plugins).filter(([_, v]) => v.run.usage && v.run.category == k.toLowerCase())
               let usage = Object.keys(Object.fromEntries(cmd))
               if (usage.length == 0) return
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
               print += commands.sort((a, b) => a.usage.localeCompare(b.usage)).map(v => `	◦  ${isPrefix + v.usage} ${v.use}`).join('\n')
            }
            client.sendMessageModify(m.chat, print + '\n\n' + global.footer, m, {
               ads: false,
               largeThumb: true
            })
         }
      } catch (e) {
         client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false
}