exports.run = {
   usage: ['threads'],
   use: 'link',
   category: 'downloader',
   async: async (m, { client, args, isPrefix, command, Func }) => {
       try {
           if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'https://www.threads.net/@httpnald_/post/CwWvCFvJr_N/?igshid=NTc4MTIwNjQ2YQ=='), m);

           client.sendReact(m.chat, '🕒', m.key);

           const json = await Func.fetchJson(`https://api.betabotz.eu.org/api/download/threads?url=${encodeURIComponent(args[0])}&apikey=beta-Ibrahim1209`);
           if (!json.status) return client.reply(m.chat, Func.jsonFormat(json), m);

           const { image_urls, video_urls } = json.result;

           // Send images
           for (let img of image_urls) {
               client.sendFile(m.chat, img, 'pic.jpg', '', m);
               await Func.delay(1500);
           }

           // Send videos
           for (let video of video_urls) {
               client.sendFile(m.chat, video.download_url, 'video.mp4', '', m);
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
};
