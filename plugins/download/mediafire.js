const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { decode } = require('html-entities');

exports.run = {
   usage: ['mediafire'],
   hidden: ['mf'],
   use: 'link',
   category: 'downloader',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      users,
      env,
      Scraper,
      Func
   }) => {
      try {
         if (!args || !args[0]) {
            return client.reply(m.chat, Func.example(isPrefix, command, 'https://www.mediafire.com/file/1fqjqg7e8e2v3ao/YOWA.v8.87_By.SamMods.apk/file'), m);
         }
         if (!args[0].match(/(https:\/\/www.mediafire.com\/)/gi)) {
            return client.reply(m.chat, global.status.invalid, m);
         }
         
         client.sendReact(m.chat, '🕒', m.key);
         
         const json = await Func.fetchJson(`https://api.betabotz.eu.org/api/download/mediafire?url=${encodeURIComponent(args[0])}&apikey=beta-Ibrahim1209`);
         if (!json.status) {
            return client.reply(m.chat, Func.jsonFormat(json), m);
         }

         // Ensure filesize is a string
         const filesize = json.result.filesizeH.toString();
         console.log(`Filesize: ${filesize}`); // Debugging: Check filesize value

         let text = `乂  *M E D I A F I R E*\n\n`;
         text += '	◦  *Name* : ' + unescape(decode(json.result.filename)) + '\n';
         text += '	◦  *Size* : ' + filesize + '\n'; // Use string version of filesize
         text += '	◦  *Extension* : ' + json.result.ext + '\n';
         text += '	◦  *Type* : ' + json.result.filetype + '\n';
         text += '	◦  *Uploaded* : ' + json.result.upload_date + '\n\n';
         text += global.footer;
         
         // Convert filesize from string to bytes
         const sizeUnits = { B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3, TB: 1024 ** 4 };
         const sizeMatch = filesize.match(/([\d.]+)\s*([a-zA-Z]+)/);
         if (!sizeMatch) {
            throw new Error('Unable to determine file size.');
         }

         const sizeValue = parseFloat(sizeMatch[1]);
         const sizeUnit = sizeUnits[sizeMatch[2].toUpperCase()] || 1;
         const sizeInBytes = sizeValue * sizeUnit;
         const fileSizeInMB = sizeInBytes / (1024 * 1024);

         // Determine if file is a video based on the file extension
         const extname = path.extname(json.result.filename).toLowerCase();
         const isVideo = ['.mp4', '.avi', '.mov', '.mkv', '.webm'].includes(extname);
         const isDocument = isVideo && fileSizeInMB > 99;

         const maxUpload = users.premium ? env.max_upload : env.max_upload_free;
         const chSize = Func.sizeLimit(sizeInBytes.toString(), maxUpload.toString());
         const isOver = users.premium ? `💀 File size (${filesize}) exceeds the maximum limit.` : `⚠️ File size (${filesize}), you can only download files with a maximum size of ${env.max_upload_free} MB and for premium users a maximum of ${env.max_upload} MB.`;
         
         if (chSize.oversize) {
            return client.reply(m.chat, isOver, m);
         }
         
            client.sendFile(m.chat, json.result.url, unescape(decode(json.result.filename)), text, m, { document: isDocument });
       
         
      } catch (e) {
         console.log(e);
         client.reply(m.chat, Func.jsonFormat(e), m);
      }
   },
   error: false,
   limit: true,
   cache: true,
   location: __filename
}
