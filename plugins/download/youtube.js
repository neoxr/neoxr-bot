const axios = require('axios');
const fs = require('fs');
const path = require('path');

exports.run = {
    usage: ['ytmp3', 'ytmp4'],
    hidden: ['yta', 'ytv'],
    use: 'link',
    category: 'downloader',
    async: async (m, { client, args, isPrefix, command, users, env, Func }) => {
        try {
            if (/yt?(a|mp3)/i.test(command)) {
                if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'https://youtu.be/zaRFmdtLhQ8'), m);
                if (!/^(?:https?:\/\/)?(?:www\.|m\.|music\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w\-_]+)\&?/.test(args[0])) return client.reply(m.chat, global.status.invalid, m);
                client.sendReact(m.chat, '🕒', m.key);

                // Step 1: Call the new API to fetch audio download link
                const downloadResponse = await axios.get(`https://api.betabotz.eu.org/api/download/ytmp3?url=${args[0]}&apikey=beta-Ibrahim1209`);
                const result = downloadResponse.data.result;

                // Step 2: Check if the response is valid
                if (!result || !result.mp3) {
                    return client.reply(m.chat, 'Unable to fetch the audio link. Please try again later.', m);
                }

                let caption = `乂 *Y T - A U D I O*\n\n`;
                caption += `    ◦  Title : ${result.title}\n`;
                caption += `    ◦  Size : ${result.size || 'Unknown'}\n`;
                caption += `    ◦  Duration : ${result.duration} seconds\n`;
                caption += global.footer;

                // Step 3: Send the audio file
                await client.sendFile(m.chat, result.mp3, `${result.title}.mp3`, caption, m, { document: false });

            } else if (/yt?(v|mp4)/i.test(command)) {
                if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'https://youtu.be/zaRFmdtLhQ8'), m);
                if (!/^(?:https?:\/\/)?(?:www\.|m\.|music\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w\-_]+)\&?/.test(args[0])) return client.reply(m.chat, global.status.invalid, m);
                client.sendReact(m.chat, '🕒', m.key);

                // Step 1: Call the new API to fetch video download link
                const downloadResponse = await axios.get(`https://api.betabotz.eu.org/api/download/ytmp4?url=${args[0]}&apikey=beta-Ibrahim1209`);
                const result = downloadResponse.data.result;

                // Step 2: Check if the response is valid
                if (!result || !result.mp4) {
                    return client.reply(m.chat, 'Unable to fetch the video link. Please try again later.', m);
                }

                // Step 3: Estimate file size before downloading
                const { headers } = await axios.head(result.mp4);
                const fileSizeInBytes = parseInt(headers['content-length'], 10);
                const fileSizeInMB = fileSizeInBytes / (1024 * 1024);

                const sizeLimit = users.premium ? env.max_upload : env.max_upload_free;
                if (fileSizeInMB > sizeLimit) {
                    const warningMessage = users.premium
                        ? `💀 File size (${fileSizeInMB.toFixed(2)} MB) exceeds the maximum limit. Download it yourself via this link: ${result.mp4}`
                        : `⚠️ File size (${fileSizeInMB.toFixed(2)} MB) exceeds the maximum limit of ${env.max_upload_free} MB for free users and ${env.max_upload} MB for premium users.`;
                    return client.reply(m.chat, warningMessage, m);
                }

                // Step 4: Download the video file
                const videoPath = path.join(__dirname, `${result.title}.mp4`);
                const videoResponse = await axios.get(result.mp4, { responseType: 'stream' });
                const writer = fs.createWriteStream(videoPath);

                videoResponse.data.pipe(writer);

                writer.on('finish', async () => {
                    const caption = `乂 *Y T - V I D E O*\n\n` +
                                    `    ◦  Title : ${result.title}\n` +
                                    `    ◦  Duration : ${result.duration} seconds\n`;

                    // Send the video file
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

            }
        } catch (e) {
            console.error(e);
            return client.reply(m.chat, Func.jsonFormat(e), m);
        }
    },
    error: false,
    limit: true,
    cache: true,
    location: __filename
};
