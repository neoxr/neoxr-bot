exports.run = {
   usage: ['xvideos'],
   hidden: ['getxvideos'],
   use: 'query <𝘱𝘳𝘦𝘮𝘪𝘶𝘮>',
   category: 'porn',
   async: async (m, { client, text, args, isPrefix, command, Func }) => {
      try {
         if (command === 'xvideos') {
            if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'step mom'), m);
            client.sendReact(m.chat, '🕒', m.key);

            let json = await Func.fetchJson(`https://api.betabotz.eu.org/api/search/xvideos?query=${text}&apikey=beta-Ibrahim1209`);
            if (!json.status) return client.reply(m.chat, global.status.fail, m);

            // Prepare button sections for all results
            const sections = [];
            const buttonsPerSection = 5; // Adjust based on platform limits

            for (let i = 0; i < json.result.length; i += buttonsPerSection) {
               const rows = json.result.slice(i, i + buttonsPerSection).map(v => ({
                  title: `${v.title}`,
                  description: `Duration: ${v.duration}`,
                  id: `${isPrefix}getxvideos ${v.url}` // ID for button interaction
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

            const combinedCaption = "*X V I D E O S  S E A R C H*\n\nResults for your search: " + text + ".\n\nPlease select a video from the options below to view more details.";

            // Send the message with buttons for all results
            await client.sendIAMessage(m.chat, buttons, m, {
               header: '',
               content: combinedCaption
            });

         } else if (command === 'getxvideos') {
            if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'your link'), m);
            if (!args[0].match(/(?:https?:\/\/(www\.)?(xvideos)\.(com)\S+)?$/)) return client.reply(m.chat, global.status.invalid, m);
            client.sendReact(m.chat, '🕒', m.key);

            let json = await Func.fetchJson(`https://api.betabotz.eu.org/api/download/xvideosdl?url=${args[0]}&apikey=beta-Ibrahim1209`);
            if (!json.status) return client.reply(m.chat, Func.jsonFormat(json), m);

            // Send only the caption with the video file
            let teks = `乂  *X V I D E O S*\n\n`;
            teks += '◦  *Name* : ' + json.result.title + '\n';
            teks += '◦  *Views* : ' + json.result.views + '\n';
            teks += '◦  *Keywords* : ' + json.result.keyword + '\n';
            teks += global.footer;

            // Send the video file with the caption
            client.sendFile(m.chat, json.result.url, '', teks, m);
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
