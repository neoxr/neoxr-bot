const { decode } = require('html-entities');

exports.run = {
   usage: ['pin'],
   use: 'link',
   category: 'downloader',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      Func
   }) => {
      try {
         if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'https://pin.it/5fXaAWE'), m);
         if (!args[0].match(/pin(?:terest)?(?:\.it|\.com)/)) return client.reply(m.chat, global.status.invalid, m);
         
         client.sendReact(m.chat, '🕒', m.key);
         
         const json = await Func.fetchJson(`https://api.betabotz.eu.org/api/download/pinterest?url=${encodeURIComponent(args[0])}&apikey=beta-Ibrahim1209`);
         if (!json.result.success) return client.reply(m.chat, Func.jsonFormat(json), m);
         
         const { data } = json.result;
         let mediaUrl = data.image;

         if (/image/.test(data.media_type)) {
            client.sendFile(m.chat, mediaUrl, '', '', m);
         } else {
            return client.reply(m.chat, global.status.invalid, m);
         }
      } catch {
         return client.reply(m.chat, global.status.error, m);
      }
   },
   error: false,
   limit: true,
   cache: true,
   verified: true,
   location: __filename
}
