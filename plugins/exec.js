const { exec } = require('child_process')
const syntax = require('syntax-error')
exports.run = {
   async: async (m, {
      client,
      body,
      ctx,
      isOwner,
      Func,
      Scraper
   }) => {
      if (typeof body === 'object' || !isOwner) return
      let command, text
      let x = body && body.trim().split`\n`,
         y = ''
      command = x[0] ? x[0].split` ` [0] : ''
      y += x[0] ? x[0].split` `.slice`1`.join` ` : '', y += x ? x.slice`1`.join`\n` : ''
      text = y.trim()
      if (!text) return
      if (command === '=>') {
         try {
            var evL = await eval(`(async () => { return ${text} })()`)
            client.reply(m.chat, Func.jsonFormat(evL), m)
         } catch (e) {
            let err = await syntax(text)
            m.reply(typeof err != 'undefined' ? Func.texted('monospace', err) + '\n\n' : '' + require('util').format(e))
         }
      } else if (command === '>') {
         try {
            var evL = await eval(`(async () => { ${text} })()`)
            m.reply(Func.jsonFormat(evL))
         } catch (e) {
            let err = await syntax(text)
            m.reply(typeof err != 'undefined' ? Func.texted('monospace', err) + '\n\n' : '' + Func.jsonFormat(e))
         }
      } else if (command == '$') {
         client.sendReact(m.chat, '🕒', m.key)
         exec(text.trim(), (err, stdout) => {
            if (err) return m.reply(err.toString())
            if (stdout) return m.reply(stdout.toString())
         })
      }
   },
   error: false,
   cache: true,
   location: __filename
}