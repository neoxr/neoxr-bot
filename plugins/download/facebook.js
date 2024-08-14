exports.run = {
   usage: ['fb'],
   hidden: ['fbdl', 'fbvid'],
   use: 'link',
   category: 'downloader',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      users,
      Scraper,
      env,
      Func
   }) => {
      try {
         // Validate and extract the link
         if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'https://fb.watch/7B5KBCgdO3'), m);
         if (!args[0].match(/(?:https?:\/\/(web\.|www\.|m\.)?(facebook|fb)\.(com|watch)\S+)?$/)) return client.reply(m.chat, global.status.invalid, m);
         
         // Indicate that the bot is processing the request
         client.sendReact(m.chat, '🕒', m.key);
         
         // Fetch the video download link using the provided API
         const json = await Func.fetchJson(`https://api.lolhuman.xyz/api/facebook?apikey=GataDiosV2&url=${encodeURIComponent(args[0])}`);
         if (json.status !== 200 || !json.result || json.result.length === 0) return client.reply(m.chat, global.status.fail, m);
         
         // Use the first result (since the response only includes a single download link)
         const result = json.result[0];
         
         // Get the file size
         const size = await Func.getSize(result);
         const chSize = Func.sizeLimit(size, users.premium ? env.max_upload : env.max_upload_free);
         
         // Check if the file size exceeds the user's limit
         const isOver = users.premium
            ? `💀 File size (${size}) exceeds the maximum limit, download it by yourself via this link : ${await (await Scraper.shorten(result)).data.url}`
            : `⚠️ File size (${size}), you can only download files with a maximum size of ${env.max_upload_free} MB and for premium users a maximum of ${env.max_upload} MB.`;
         
         if (chSize.oversize) return client.reply(m.chat, isOver, m);
         
         // Send the video file to the user
         await client.sendFile(m.chat, result, Func.filename('mp4'), '', m);
         
      } catch (e) {
         console.log(e);
         return client.reply(m.chat, Func.jsonFormat(e), m);
      }
   },
   error: false,
   limit: true,
   cache: true,
   location: __filename
};
