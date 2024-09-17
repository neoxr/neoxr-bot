const axios = require('axios');
const fs = require('fs');
const path = require('path');

exports.run = {
    usage: ['video'],
    hidden: ['playvid', 'playvideo'],
    use: 'query',
    category: 'downloader',
    async: async (m, { client, text, isPrefix, command, env, users, Func }) => {
        try {
            // Step 1: Validate user input
            if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'lathi'), m);
            client.sendReact(m.chat, '🕒', m.key);

            // Step 2: Search YouTube using scraper API
            const searchResponse = await axios.get(`https://api.betabotz.eu.org/api/search/yts?query=${text}&apikey=beta-Ibrahim1209`);
            const firstResult = searchResponse.data.result[0];

            // Step 3: If no result found, inform the user
            if (!firstResult) return client.reply(m.chat, 'No video found. Please check your search or try again later.', m);

            // Step 4: Use the first search result's URL to download the video
            const videoUrl = firstResult.url;  // Get the URL of the first result

            // Step 5: Call the download API using the found URL
            const downloadResponse = await axios.get(`https://api.betabotz.eu.org/api/download/ytmp4?url=${videoUrl}&apikey=beta-Ibrahim1209`);
            const result = downloadResponse.data.result;

            // Step 6: If no valid MP4 download link, notify the user
            if (!result || !result.mp4) {
                return client.reply(m.chat, 'Unable to fetch download link for the video.', m);
            }

            // Step 7: Estimate file size before downloading
            const { headers } = await axios.head(result.mp4);
            const fileSizeInBytes = parseInt(headers['content-length'], 10);
            const fileSizeInMB = fileSizeInBytes / (1024 * 1024);

            const sizeLimit = users.premium ? env.max_upload : env.max_upload_free;
            if (fileSizeInMB > sizeLimit) {
                const downloadLink = await (await Func.shorten(result.mp4)).data.url;
                return client.reply(m.chat, `💀 File size (${fileSizeInMB.toFixed(2)} MB) exceeds the limit. Download manually via this link: ${downloadLink}`, m);
            }

            // Step 8: Download the video file
            const videoPath = path.join(__dirname, `${result.title}.mp4`);
            const videoResponse = await axios.get(result.mp4, { responseType: 'stream' });
            const writer = fs.createWriteStream(videoPath);

            videoResponse.data.pipe(writer);

            writer.on('finish', async () => {
                const caption = `乂  *Y T - V I D E O*\n\n` +
                                `    ◦  *Title* : ${result.title}\n` +
                                `    ◦  *Description* : ${result.description}\n` +
                                `    ◦  *Duration* : ${result.duration} seconds\n`;

                // If the video size is > 99 MB, send it as a document
                if (fileSizeInMB > 99) {
                    await client.sendFile(m.chat, videoPath, `${result.title}.mp4`, caption, m, { document: true });
                } else {
                    await client.sendFile(m.chat, videoPath, `${result.title}.mp4`, caption, m);
                }

                // Delete the downloaded file after sending
                fs.unlinkSync(videoPath);
            });

            writer.on('error', (error) => {
                console.error('Download failed', error);
                client.reply(m.chat, 'Error occurred while downloading the file.', m);
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
