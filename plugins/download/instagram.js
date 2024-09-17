const { Youtube } = require('@neoxr/youtube-scraper')
const yt = new Youtube({
   fileAsUrl: false
})

exports.run = {
   usage: ['ig'],
   hidden: ['igdl'],
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
         if (!args || !args[0]) {
            return client.reply(m.chat, Func.example(isPrefix, command, 'https://www.instagram.com/p/CK0tLXyAzEI'), m);
         }
         if (!args[0].match(/(https:\/\/www.instagram.com)/gi)) {
            return client.reply(m.chat, global.status.invalid, m);
         }

         client.sendReact(m.chat, '🕒', m.key);
         let old = new Date();

         let URL = await ndown(args[0]);
         if (!URL.status) {
            return client.reply(m.chat, Func.jsonFormat(URL), m);
         }

         // Process each file only once
         const processedUrls = new Set();
         
         for (let item of URL.data) {
            // Check if the URL has already been processed
            if (processedUrls.has(item.url)) {
               continue; // Skip if already processed
            }

            processedUrls.add(item.url);

            // Get file details
            const file = await Func.getFile(item.url);
            const fileExtension = file.extension; // Get the file extension
            const filename = `file.${fileExtension}`; // Construct the filename with the correct extension

            // Determine if the file is an image or a video
            if (['jpg', 'jpeg', 'png', 'webp'].includes(fileExtension)) {
               // Send image
               await client.sendFile(m.chat, item.url, filename, `🍟 *Fetching* : ${((new Date() - old) * 1)} ms`, m);
            } else {
               // Send video
               await client.sendFile(m.chat, item.url, 'video.mp4', `🍟 *Fetching* : ${((new Date() - old) * 1)} ms`, m);
            }

            // Ensure delay between sends
            await Func.delay(1500);
         }
      } catch (e) {
         console.log(e);
         return client.reply(m.chat, Func.jsonFormat(e), m);
      }
   },
   error: false,
   limit: true,
   cache: true,
   verified: true,
   location: __filename
}
