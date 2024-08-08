const axios = require('axios');
const fs = require('fs');
const path = require('path');

exports.run = {
   usage: ['gdrive'],
   use: 'link',
   category: 'downloader',
   async: async (m, { client, text, isPrefix, command, users, env, Func, Scraper }) => {
      try {
         if (!text) {
            return client.reply(m.chat, Func.example(isPrefix, command, 'https://drive.google.com/file/d/1sCMC4pXfPBdRvLhH0QCrg8dypKkI_i0y/view?usp=drive_link'), m);
         }
const axios = require('axios');
const fs = require('fs');
const path = require('path');

exports.run = {
   usage: ['gdrive'],
   use: 'link',
   category: 'downloader',
   async: async (m, { client, text, isPrefix, command, users, env, Func, Scraper }) => {
      try {
         if (!text) {
            return client.reply(m.chat, Func.example(isPrefix, command, 'https://drive.google.com/file/d/1sCMC4pXfPBdRvLhH0QCrg8dypKkI_i0y/view?usp=drive_link'), m);
         }
           const axios = require('axios');
const fs = require('fs');
const path = require('path');

exports.run = {
   usage: ['gdrive'],
   use: 'link',
   category: 'downloader',
   async: async (m, { client, text, isPrefix, command, users, env, Func, Scraper }) => {
      try {
         if (!text) {
            return client.reply(m.chat, Func.example(isPrefix, command, 'https://drive.google.com/file/d/1sCMC4pXfPBdRvLhH0QCrg8dypKkI_i0y/view?usp=drive_link'), m);
         }
           client.sendReact(m.chat, '🕒', m.key);
         const json = await Func.fetchJson(`https://widipe.com/download/gdrive?url=${text}`);
         
         if (!json.status) {
            return client.reply(m.chat, 'Failed to retrieve the download link from Google Drive.', m);
         }

         const { data, fileName, fileSize } = json.result;

         // Convert fileSize to bytes for comparison
         const sizeUnits = { B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3, TB: 1024 ** 4 };
         const sizeMatch = fileSize.match(/([\d.]+)\s*([a-zA-Z]+)/);
         if (!sizeMatch) {
            return client.reply(m.chat, 'Unable to determine file size.', m);
         }

         const sizeValue = parseFloat(sizeMatch[1]);
         const sizeUnit = sizeUnits[sizeMatch[2].toUpperCase()] || 1;
         const sizeInBytes = sizeValue * sizeUnit;

         const maxUpload = users.premium ? env.max_upload : env.max_upload_free;
         const isOver = `💀 File size (${fileSize}) exceeds the maximum limit, download it by yourself via this link: ${await (await Scraper.shorten(data)).data.url}`;
         const chSize = Func.sizeLimit(sizeInBytes.toString(), maxUpload.toString());

         if (chSize.oversize) {
            return client.reply(m.chat, isOver, m);
         }

         // Determine if file is a video based on the file extension
         const extname = path.extname(fileName).toLowerCase();
         const isVideo = ['.mp4', '.avi', '.mov', '.mkv', '.webm'].includes(extname);
         const fileSizeInMB = sizeInBytes / (1024 * 1024);
         const isDocument = isVideo && fileSizeInMB > 99;

         // Download the file locally
         const response = await axios({
            url: data,
            method: 'GET',
            responseType: 'stream',
            headers: {
               'User-Agent': 'Mozilla/5.0'
            }
         });

         // Sanitize the filename
         const sanitizedFileName = fileName.replace(/[\\/?<>[\]]/g, '_');

         // Ensure the temp directory exists
         const tempDir = path.join(__dirname, 'temp');
         if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
         }

         const tempFilePath = path.join(tempDir, sanitizedFileName);
         const writer = fs.createWriteStream(tempFilePath);

         response.data.pipe(writer);

         writer.on('finish', async () => {
            try {
               // Prepare message content
               const message = `乂  *G D R I V E  - F I L E*\n\n` +
                               `    ◦  *File Name* : ${fileName}\n` +
                               `    ◦  *File Size* : ${fileSize}\n`;

               // Send the file to the user
               await client.sendFile(m.chat, tempFilePath, fileName, message, m, { document: isDocument });

               // Clean up the temp file
               fs.unlinkSync(tempFilePath);
            } catch (uploadError) {
               console.error('Error uploading file:', uploadError);
               client.reply(m.chat, 'Failed to upload the file to WhatsApp.', m);
               // Clean up the temp file in case of upload error
               fs.unlinkSync(tempFilePath);
            }
         });

         writer.on('error', (err) => {
            console.error('Error downloading file:', err);
            client.reply(m.chat, 'Failed to download the file.', m);
         });

      } catch (e) {
         console.log('Unhandled Error:', e);
         return client.reply(m.chat, 'An unexpected error occurred.', m);
      }
   },
   error: false,
   limit: true,
   cache: true,
   verified: true,
   location: __filename
};
         const json = await Func.fetchJson(`https://widipe.com/download/gdrive?url=${text}`);
         
         if (!json.status) {
            return client.reply(m.chat, 'Failed to retrieve the download link from Google Drive.', m);
         }

         const { data, fileName, fileSize } = json.result;

         // Convert fileSize to bytes for comparison
         const sizeUnits = { B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3, TB: 1024 ** 4 };
         const sizeMatch = fileSize.match(/([\d.]+)\s*([a-zA-Z]+)/);
         if (!sizeMatch) {
            return client.reply(m.chat, 'Unable to determine file size.', m);
         }

         const sizeValue = parseFloat(sizeMatch[1]);
         const sizeUnit = sizeUnits[sizeMatch[2].toUpperCase()] || 1;
         const sizeInBytes = sizeValue * sizeUnit;

         const maxUpload = users.premium ? env.max_upload : env.max_upload_free;
         const isOver = `💀 File size (${fileSize}) exceeds the maximum limit, download it by yourself via this link: ${await (await Scraper.shorten(data)).data.url}`;
         const chSize = Func.sizeLimit(sizeInBytes.toString(), maxUpload.toString());

         if (chSize.oversize) {
            return client.reply(m.chat, isOver, m);
         }

         // Determine if file is a video based on the file extension
         const extname = path.extname(fileName).toLowerCase();
         const isVideo = ['.mp4', '.avi', '.mov', '.mkv', '.webm'].includes(extname);
         const fileSizeInMB = sizeInBytes / (1024 * 1024);
         const isDocument = isVideo && fileSizeInMB > 99;

         // Download the file locally
         const response = await axios({
            url: data,
            method: 'GET',
            responseType: 'stream',
            headers: {
               'User-Agent': 'Mozilla/5.0'
            }
         });

         // Sanitize the filename
         const sanitizedFileName = fileName.replace(/[\\/?<>[\]]/g, '_');

         // Ensure the temp directory exists
         const tempDir = path.join(__dirname, 'temp');
         if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
         }

         const tempFilePath = path.join(tempDir, sanitizedFileName);
         const writer = fs.createWriteStream(tempFilePath);

         response.data.pipe(writer);

         writer.on('finish', async () => {
            try {
               // Prepare message content
               const message = `乂  *G D R I V E  - F I L E*\n\n` +
                               `    ◦  *File Name* : ${fileName}\n` +
                               `    ◦  *File Size* : ${fileSize}\n`;

               // Send the file to the user
               await client.sendFile(m.chat, tempFilePath, fileName, message, m, { document: isDocument });

               // Clean up the temp file
               fs.unlinkSync(tempFilePath);
            } catch (uploadError) {
               console.error('Error uploading file:', uploadError);
               client.reply(m.chat, 'Failed to upload the file to WhatsApp.', m);
               // Clean up the temp file in case of upload error
               fs.unlinkSync(tempFilePath);
            }
         });

         writer.on('error', (err) => {
            console.error('Error downloading file:', err);
            client.reply(m.chat, 'Failed to download the file.', m);
         });

      } catch (e) {
         console.log('Unhandled Error:', e);
         return client.reply(m.chat, 'An unexpected error occurred.', m);
      }
   },
   error: false,
   limit: true,
   cache: true,
   verified: true,
   location: __filename
};
         const json = await Func.fetchJson(`https://widipe.com/download/gdrive?url=${text}`);
         
         if (!json.status) {
            return client.reply(m.chat, 'Failed to retrieve the download link from Google Drive.', m);
         }

         const { data, fileName, fileSize } = json.result;

         // Convert fileSize to bytes for comparison
         const sizeUnits = { B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3, TB: 1024 ** 4 };
         const sizeMatch = fileSize.match(/([\d.]+)\s*([a-zA-Z]+)/);
         if (!sizeMatch) {
            return client.reply(m.chat, 'Unable to determine file size.', m);
         }

         const sizeValue = parseFloat(sizeMatch[1]);
         const sizeUnit = sizeUnits[sizeMatch[2].toUpperCase()] || 1;
         const sizeInBytes = sizeValue * sizeUnit;

         const maxUpload = users.premium ? env.max_upload : env.max_upload_free;
         const isOver = `💀 File size (${fileSize}) exceeds the maximum limit, download it by yourself via this link: ${await (await Scraper.shorten(data)).data.url}`;
         const chSize = Func.sizeLimit(sizeInBytes.toString(), maxUpload.toString());

         if (chSize.oversize) {
            return client.reply(m.chat, isOver, m);
         }

         // Determine if file is a video based on the file extension
         const extname = path.extname(fileName).toLowerCase();
         const isVideo = ['.mp4', '.avi', '.mov', '.mkv', '.webm'].includes(extname);
         const fileSizeInMB = sizeInBytes / (1024 * 1024);
         const isDocument = isVideo && fileSizeInMB > 99;

         // Download the file locally
         const response = await axios({
            url: data,
            method: 'GET',
            responseType: 'stream',
            headers: {
               'User-Agent': 'Mozilla/5.0'
            }
         });

         // Sanitize the filename
         const sanitizedFileName = fileName.replace(/[\\/?<>[\]]/g, '_');

         // Ensure the temp directory exists
         const tempDir = path.join(__dirname, 'temp');
         if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
         }

         const tempFilePath = path.join(tempDir, sanitizedFileName);
         const writer = fs.createWriteStream(tempFilePath);

         response.data.pipe(writer);

         writer.on('finish', async () => {
            try {
               // Prepare message content
               const message = `乂  *G D R I V E  - F I L E*\n\n` +
                               `    ◦  *File Name* : ${fileName}\n` +
                               `    ◦  *File Size* : ${fileSize}\n`;

               // Send the file to the user
               await client.sendFile(m.chat, tempFilePath, fileName, message, m, { document: isDocument });

               // Clean up the temp file
               fs.unlinkSync(tempFilePath);
            } catch (uploadError) {
               console.error('Error uploading file:', uploadError);
               client.reply(m.chat, 'Failed to upload the file to WhatsApp.', m);
               // Clean up the temp file in case of upload error
               fs.unlinkSync(tempFilePath);
            }
         });

         writer.on('error', (err) => {
            console.error('Error downloading file:', err);
            client.reply(m.chat, 'Failed to download the file.', m);
         });

      } catch (e) {
         console.log('Unhandled Error:', e);
         return client.reply(m.chat, 'An unexpected error occurred.', m);
      }
   },
   error: false,
   limit: true,
   cache: true,
   verified: true,
   location: __filename
};