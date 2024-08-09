<<<<<<< HEAD
const axios = require('axios'); // Import axios library
const { Youtube } = require('@neoxr/youtube-scraper');
const yt = new Youtube({ fileAsUrl: false });
const { ytdown } = require("nayan-media-downloader");
const fs = require('fs');
const path = require('path');

exports.run = {
    usage: ['video'],
    hidden: ['playvid', 'playvideo'],
    use: 'query',
    category: 'feature',
    async: async (m, { client, text, isPrefix, command, env, users, Scraper, Func }) => {
        try {
            if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'lathi'), m);
            client.sendReact(m.chat, '🕒', m.key);

            // Step 1: Perform YouTube search using the search API
            const searchResponse = await axios.get(`https://api.betabotz.eu.org/api/search/yts?query=${text}&apikey=beta-Ibrahim1209`);

            // Get the first search result
            const firstResult = searchResponse.data.result[0];

            // Step 2: Use the first search result's URL to fetch the download link
            let URL = await ytdown(firstResult.url);

            // Check for HD video first, if not available, use the regular video
            const downloadUrl = URL.data.video_hd ? URL.data.video_hd : URL.data.video;

            // Estimate file size before downloading
            const { headers } = await axios.head(downloadUrl);
            const fileSizeInBytes = parseInt(headers['content-length'], 10);
            const fileSizeInMB = fileSizeInBytes / (1024 * 1024);

            const sizeLimit = users.premium ? env.max_upload : env.max_upload_free;
            if (fileSizeInMB > sizeLimit) {
                const warningMessage = users.premium
                    ? `💀 File size (${fileSizeInMB.toFixed(2)} MB) exceeds the maximum limit. Download it yourself via this link: ${await (await Scraper.shorten(downloadUrl)).data.url}`
                    : `⚠️ File size (${fileSizeInMB.toFixed(2)} MB) exceeds the maximum limit of ${env.max_upload_free} MB for free users and ${env.max_upload} MB for premium users.`;
                return client.reply(m.chat, warningMessage, m);
            }

            // Download the video file
            const videoPath = path.join(__dirname, `${firstResult.title}.mp4`);
            const videoResponse = await axios.get(downloadUrl, { responseType: 'stream' });
            const writer = fs.createWriteStream(videoPath);

            videoResponse.data.pipe(writer);

            writer.on('finish', async () => {
                if (fileSizeInMB > 99) {
                    await client.sendFile(m.chat, videoPath, `${firstResult.title}.mp4`, `乂  *Y T - V I D E O*\n\n` +
                        `    ◦  *Title* : ${firstResult.title}\n` +
                        `    ◦  *Uploader* : ${firstResult.author.name}\n` +
                        `    ◦  *Duration* : ${firstResult.duration}\n` +
                        `    ◦  *Views* : ${firstResult.views}\n` +
                        `    ◦  *Uploaded* : ${firstResult.published_at}\n`, m, { document: true });
                } else {
                    await client.sendFile(m.chat, videoPath, `${firstResult.title}.mp4`, `乂  *Y T - V I D E O*\n\n` +
                        `    ◦  *Title* : ${firstResult.title}\n` +
                        `    ◦  *Uploader* : ${firstResult.author.name}\n` +
                        `    ◦  *Duration* : ${firstResult.duration}\n` +
                        `    ◦  *Views* : ${firstResult.views}\n` +
                        `    ◦  *Uploaded* : ${firstResult.published_at}\n`, m);
                }

                fs.unlinkSync(videoPath); // Delete the downloaded file after sending
            });

            writer.on('error', (error) => {
                console.error('Download failed', error);
                client.reply(m.chat, Func.jsonFormat(error), m);
            });

        } catch (e) {
            console.error(e);
            return client.reply(m.chat, Func.jsonFormat(e), m);
        }
    },
    error: false,
    restrict: true,
    cache: true,
    location: __filename
};
=======
const axios = require('axios'); // Import axios library
const { Youtube } = require('@neoxr/youtube-scraper');
const yt = new Youtube({ fileAsUrl: false });
const { ytdown } = require("nayan-media-downloader");
const fs = require('fs');
const path = require('path');

exports.run = {
    usage: ['video'],
    hidden: ['playvid', 'playvideo'],
    use: 'query',
    category: 'feature',
    async: async (m, { client, text, isPrefix, command, env, users, Scraper, Func }) => {
        try {
            if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'lathi'), m);
            client.sendReact(m.chat, '🕒', m.key);

            // Step 1: Perform YouTube search using the search API
            const searchResponse = await axios.get(`https://api.betabotz.eu.org/api/search/yts?query=${text}&apikey=beta-Ibrahim1209`);

            // Get the first search result
            const firstResult = searchResponse.data.result[0];

            // Step 2: Use the first search result's URL to fetch the download link
            let URL = await ytdown(firstResult.url);

            // Check for HD video first, if not available, use the regular video
            const downloadUrl = URL.data.video_hd ? URL.data.video_hd : URL.data.video;

            // Estimate file size before downloading
            const { headers } = await axios.head(downloadUrl);
            const fileSizeInBytes = parseInt(headers['content-length'], 10);
            const fileSizeInMB = fileSizeInBytes / (1024 * 1024);

            const sizeLimit = users.premium ? env.max_upload : env.max_upload_free;
            if (fileSizeInMB > sizeLimit) {
                const warningMessage = users.premium
                    ? `💀 File size (${fileSizeInMB.toFixed(2)} MB) exceeds the maximum limit. Download it yourself via this link: ${await (await Scraper.shorten(downloadUrl)).data.url}`
                    : `⚠️ File size (${fileSizeInMB.toFixed(2)} MB) exceeds the maximum limit of ${env.max_upload_free} MB for free users and ${env.max_upload} MB for premium users.`;
                return client.reply(m.chat, warningMessage, m);
            }

            // Download the video file
            const videoPath = path.join(__dirname, `${firstResult.title}.mp4`);
            const videoResponse = await axios.get(downloadUrl, { responseType: 'stream' });
            const writer = fs.createWriteStream(videoPath);

            videoResponse.data.pipe(writer);

            writer.on('finish', async () => {
                if (fileSizeInMB > 99) {
                    await client.sendFile(m.chat, videoPath, `${firstResult.title}.mp4`, `乂  *Y T - V I D E O*\n\n` +
                        `    ◦  *Title* : ${firstResult.title}\n` +
                        `    ◦  *Uploader* : ${firstResult.author.name}\n` +
                        `    ◦  *Duration* : ${firstResult.duration}\n` +
                        `    ◦  *Views* : ${firstResult.views}\n` +
                        `    ◦  *Uploaded* : ${firstResult.published_at}\n`, m, { document: true });
                } else {
                    await client.sendFile(m.chat, videoPath, `${firstResult.title}.mp4`, `乂  *Y T - V I D E O*\n\n` +
                        `    ◦  *Title* : ${firstResult.title}\n` +
                        `    ◦  *Uploader* : ${firstResult.author.name}\n` +
                        `    ◦  *Duration* : ${firstResult.duration}\n` +
                        `    ◦  *Views* : ${firstResult.views}\n` +
                        `    ◦  *Uploaded* : ${firstResult.published_at}\n`, m);
                }

                fs.unlinkSync(videoPath); // Delete the downloaded file after sending
            });

            writer.on('error', (error) => {
                console.error('Download failed', error);
                client.reply(m.chat, Func.jsonFormat(error), m);
            });

        } catch (e) {
            console.error(e);
            return client.reply(m.chat, Func.jsonFormat(e), m);
        }
    },
    error: false,
    restrict: true,
    cache: true,
    location: __filename
};
>>>>>>> b1000b5ca428847cca4a9f7ca01c32afa59b6a18
