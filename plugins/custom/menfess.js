exports.run = {
   usage: ['menfess'],
   hidden: ['menfes', 'confes', 'confess'],
   use: '628xxx | ayu | i love u',
   category: 'mail',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      Func
   }) => {
      global.db.menfess = global.db.menfess ? global.db.menfess : {}
      if (!text) return client.reply(m.chat, Func.example(isPrefix, command, '628xxxxx | asep | i love u'), m)
      let [jid, name, msg] = text.split`|`
      if ((!jid || !name || !msg)) return client.reply(m.chat, Func.example(isPrefix, command, '628xxxxx | asep | i love u'), m)
      let p = (await client.onWhatsApp(jid))[0] || {}
      if (!p.exists) return client.reply(m.chat, Func.texted('bold', '🚩 Number not registered on WhatsApp.'), m)
      if (p.jid == m.sender) return client.reply(m.chat, Func.texted('bold', '🚩 Can\'t send massage to yourself.'), m)
      let mf = Object.values(global.db.menfess).find(mf => mf.status === true)
      if (mf) return !0
      try {
         let id = +new Date
         let txt = `📩 You got *+1* menfess message from : *${name.trim()}*\n\n`
         txt += `“${msg.trim()}”`
         await client.reply(p.jid, txt, null).then(() => {
            client.sendReact(m.chat, '✅', m.key)
            global.db.menfess[id] = {
               id,
               from: m.sender,
               name,
               receiver: p.jid,
               msg,
               status: false
            }
            return !0
         })
      } catch (e) {
         client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true,
   restrict: true,
   cache: true,
   location: __filename
}
