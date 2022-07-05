const { exec } = require('child_process')
const syntax = require('syntax-error')
exports.run = {
   async: async (m, {
      client,
      body
   }) => {
      if (body) {
         let command, text
         let x = body.trim().split`\n`,
            y = ''
         command = x[0].split` ` [0]
         y += x[0].split` `.slice`1`.join` `, y += x.slice`1`.join`\n`
         text = y.trim()
         if (command == '>') {
            if (!text) return
            try {
               evL = await eval(`(async () => { ${text} })()`)
               client.reply(m.chat, Func.jsonFormat(evL), m)
            } catch (e) {
               let err = await syntax(text)
               client.reply(m.chat, typeof err != 'undefined' ? Func.texted('monospace', err) + '\n\n' : '' + Func.jsonFormat(e), m)
            }
         } else if (command == '=>') {
            if (!text) return
            try {
               evL = await eval(`(async () => { return ${text} })()`)
               client.reply(m.chat, Func.jsonFormat(evL), m)
            } catch (e) {
               let err = await syntax(text)
               client.reply(m.chat, typeof err != 'undefined' ? Func.texted('monospace', err) + '\n\n' : '' + Func.jsonFormat(e), m)
            }
         } else if (command == '$') {
            if (!text) return
            client.reply(m.chat, Func.texted('bold', 'executing . . .'), m)
            exec(text, (err, stdout) => {
               if (err) return client.reply(m.chat, err.toString(), m)
               if (stdout) return client.reply(m.chat, stdout, m)
            })
         }
      }
   },
   owner: true,
   cache: true,
   location: __filename
}