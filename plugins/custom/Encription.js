exports.run = {
   usage: ['encrypt','decrypt'],
   use: 'query',
   category: 'utilities',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      Func
   }) => {       
     let txt = m.quoted ? m.quoted.text ? m.quoted.text : text ? text : m.text : m.text
     if (/^encrypt$/i.test(command)) {
     m.reply(Buffer.from(txt, 'utf-8').toString('base64'))
     }
     if (/^decrypt$/i.test(command)) {
     m.reply(Buffer.from(txt, 'base64').toString('utf-8'))
   		}},
   error: false,
   limit: true,
   cache: true,
   location: __filename
}