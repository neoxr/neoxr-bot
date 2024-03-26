exports.run = {
   usage: ['artinama'],
   hidden: ['nama'],
   use: 'name',
   category: 'utilities',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      Func
   }) => {
      try {
         if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'megawati'), m)
         client.sendReact(m.chat, '🕒', m.key)
          const json = await Api.neoxr('/artinama', {
             nama: text
       	 })
         if (!json.status) return client.reply(m.chat, global.status.fail, m)
         let teks = `◦  *Nama* : ${Func.ucword(text)}\n`
         teks += `◦  *Arti* : ${json.data.arti.split('arti:')[1]}`
         client.reply(m.chat, teks, m)
      } catch {
         return client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   restrict: true
}