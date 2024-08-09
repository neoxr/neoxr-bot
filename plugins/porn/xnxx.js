exports.run = {
   usage: ['xnxx'],
   hidden: ['getxnxx'],
   use: 'query <𝘱𝘳𝘦𝘮𝘪𝘶𝘮>',
   category: 'porn',
   async: async (m, { client, text, args, isPrefix, command, Func }) => {
      try {
         if (command === 'xnxx') {
            if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'step mom'), m);
            client.sendReact(m.chat, '🕒', m.key);

            let json = await Func.fetchJson(`https://api.cafirexos.com/api/xnxxsearch?text=${text}`);
            if (!json.status) return client.reply(m.chat, global.status.fail, m);

            // Prepare button sections for all results
            const sections = [];
            const buttonsPerSection = 5; // Adjust based on platform limits

            for (let i = 0; i < json.result.length; i += buttonsPerSection) {
               const rows = json.result.slice(i, i + buttonsPerSection).map(v => ({
                  title: `${v.title}`,
                  id: `${isPrefix}getxnxx ${v.link}` // ID for button interaction
               }));

               sections.push({
                  rows
               });
            }

            const buttons = [{
               name: 'single_select',
               buttonParamsJson: JSON.stringify({
                  title: 'Select Video',
                  sections: [{
                     title: 'Select from below to get video',
                     rows: sections.flat().map(section => section.rows).flat()
                  }]
               })
            }];

            const combinedCaption = "*X N X X  S E A R C H*\n\nHere are the results for your search: " + text + ".\n\nPlease select a video from the options below to view more details.";

            // Send the message with buttons for all results
            await client.sendIAMessage(m.chat, buttons, m, {
               header: '',
               content: combinedCaption
            });

         } else if (command === 'getxnxx') {
            if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'your link'), m);
            if (!args[0].match(/(?:https?:\/\/(www\.)?(xnxx)\.(com)\S+)?$/)) return client.reply(m.chat, global.status.invalid, m);
            client.sendReact(m.chat, '🕒', m.key);

            let json = await Func.fetchJson(`https://api.cafirexos.com/api/xnxxdl?url=${args[0]}`);
            if (!json.status) return client.reply(m.chat, Func.jsonFormat(json), m);

            // Send only the caption with the video file
            let teks = `乂  *N S F W*\n\n`;
            teks += '◦  *Name* : ' + json.result.title + '\n';
            teks += '◦  *Duration* : ' + json.result.duration + '\n';
            teks += global.footer;

            // Send the video file with the caption
            client.sendFile(m.chat, json.result.files.high, '', teks, m);
         }
      } catch (e) {
         console.log(e);
         return client.reply(m.chat, global.status.error, m);
      }
   },
   error: false,
   limit: true,
   premium: true
}
