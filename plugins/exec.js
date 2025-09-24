import { exec } from 'child_process'
import util from 'util'
import syntax from 'syntax-error'

export const run = {
   async: async (m, {
      client,
      body,
      ctx,
      isOwner,
      Utils,
      Scraper,
      waSocket
   }) => {
      if (typeof body === 'object' || !isOwner) return
      let command, text
      let x = body && body.trim().split`\n`,
         y = ''
      command = x[0] ? x[0].split` `[0] : ''
      y += x[0] ? x[0].split` `.slice`1`.join` ` : '', y += x ? x.slice`1`.join`\n` : ''
      text = y.trim()
      if (!text) return
      if (command === '=>') {
         try {
            var evL = await eval(`(async () => { return ${text} })()`)
            client.reply(m.chat, Utils.jsonFormat(evL), m)
         } catch (e) {
            let err = await syntax(text)
            m.reply(typeof err != 'undefined' ? Utils.texted('monospace', err) + '\n\n' : '' + util.format(e))
         }
      } else if (command === '>') {
         try {
            var evL = await eval(`(async () => { ${text} })()`)
            m.reply(Utils.jsonFormat(evL))
         } catch (e) {
            let err = await syntax(text)
            m.reply(typeof err != 'undefined' ? Utils.texted('monospace', err) + '\n\n' : '' + Utils.jsonFormat(e))
         }
      } else if (command == '$') {
         client.sendReact(m.chat, '🕒', m.key)
         exec(text.trim(), (err, stdout) => {
            if (err) return m.reply(err.toString())
            if (stdout) return m.reply(stdout.toString())
         })
      }
   },
   error: false
}