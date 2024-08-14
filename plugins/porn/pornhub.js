const { PornHub } = require('pornhub.js'); // Import the PornHub class
const pornhub = new PornHub(); // Create an instance of the PornHub class

exports.run = {
   usage: ['pornhub'],
   hidden: ['getpornhub'],
   use: 'query <𝘱𝘳𝘦𝘮𝘪𝘶𝘮>',
   category: 'porn',
   async: async (m, { client, text, args, isPrefix, command, Func }) => {
      try {
         if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'step mom'), m);
         client.sendReact(m.chat, '🕒', m.key);
         
         const result = await pornhub.searchVideo(text); // Use the PornHub instance to search for videos

         if (!result.data || result.data.length === 0) {
            return client.reply(m.chat, global.status.fail, m);
         }

         // Prepare button sections for all results
         const sections = [];
         const buttonsPerSection = 5; // Adjust the number of buttons per section based on platform limits

         for (let i = 0; i < result.data.length; i += buttonsPerSection) {
            const rows = result.data.slice(i, i + buttonsPerSection).map((v, index) => ({
               title: `${v.title} (${v.duration})`,
               description: `Views: ${v.views}, HD: ${v.hd}, Premium: ${v.premium}`,
               id: `${isPrefix}ytdl ${v.url}` // ID for the button interaction
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
                  title: 'Select from below to get a video',
                  rows: sections.flat().map(section => section.rows).flat()
               }]
            })
         }];

         const combinedCaption = "*P O R N H U B   S E A R C H*\n\nHere are the results for your search: " + text + ".\n\nPlease select a video from the options below. Once you make a selection, the video will be sent to you directly.";


         // Send the message with buttons for all results
         await client.sendIAMessage(m.chat, buttons, m, {
            header: '',
            content: combinedCaption
         });

      } catch (e) {
         console.log(e);
         return client.reply(m.chat, global.status.error, m);
      }
   },
   error: false,
   limit: true,
   premium: true
}
