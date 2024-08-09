exports.run = {
   usage: ['tiktok', 'tikmp3', 'tikwm', 'ttslide'],
   hidden: ['tt'],
   use: 'link',
   category: 'downloader',
   async: async (m, { client, args, isPrefix, command, Func }) => {
       try {
           if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'https://vm.tiktok.com/ZSR7c5G6y/'), m);
           if (!args[0].match('tiktok.com')) return client.reply(m.chat, global.status.invalid, m);
           
           client.sendReact(m.chat, '🕒', m.key);

           let old = new Date();
           const json = await Func.fetchJson(`https://api.betabotz.eu.org/api/download/tiktok?url=${encodeURIComponent(args[0])}&apikey=beta-Ibrahim1209`);
           if (!json.status) return m.reply(Func.jsonFormat(json));

           if (command === 'tiktok' || command === 'tt') {
               client.sendFile(m.chat, json.result.video[0], 'video.mp4', `🍟 *Fetching* : ${((new Date() - old) * 1)} ms`, m);
           }
           if (command === 'tikmp3') {
               if (!json.result.audio || json.result.audio.length === 0) {
                   return client.reply(m.chat, global.status.fail, m);
               } else {
                   client.sendFile(m.chat, json.result.audio[0], 'audio.mp3', '', m);
               }
           }
       } catch (e) {
           console.error(e);
           return client.reply(m.chat, Func.jsonFormat(e), m);
       }
   },
   error: false,
   limit: true,
   cache: true,
   location: __filename
};
