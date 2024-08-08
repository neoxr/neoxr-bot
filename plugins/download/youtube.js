const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { ytdown } = require("nayan-media-downloader");

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

                // Fetch video information
                const json = await ytdown(args[0], "audio");
                if (!json.status) return client.reply(m.chat, Func.jsonFormat(json), m);

                let caption = `乂 *Y T - A U D I O*\n\n`;
                caption += `    ◦  Title : ${json.data.title}\n`;
                caption += `    ◦  Size : ${json.data.size}\n`;
                caption += `    ◦  Duration : ${json.data.duration}\n`;
                caption += `    ◦  Bitrate : ${json.data.quality}\n\n`;
                caption += global.footer;

                client.sendMessageModify(m.chat, caption, m, {
                    largeThumb: true,
                    thumbnail: await Func.fetchBuffer(json.data.thumbnail)
                }).then(async () => {
                    // MP3 download URL
                    const downloadResponse = await axios.get(`https://api.betabotz.eu.org/api/download/ytmp3?url=${args[0]}&apikey=beta-Ibrahim1209`);
                    const downloadUrl = downloadResponse.data.result.mp3;

                    // Send the MP3 file
                    await client.sendFile(m.chat, downloadUrl, `${json.data.title}.mp3`, '', m, {
                        document: false,
                        APIC: await Func.fetchBuffer(json.data.thumbnail)
                    });
                });

            } else if (/yt?(v|mp4)/i.test(command)) {
                if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'https://youtu.be/zaRFmdtLhQ8'), m);
                if (!/^(?:https?:\/\/)?(?:www\.|m\.|music\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w\-_]+)\&?/.test(args[0])) return client.reply(m.chat, global.status.invalid, m);
                client.sendReact(m.chat, '🕒', m.key);

                // Fetch video information
                let URL = await ytdown(args[0]);

                // Check for HD video first, if not available, use the regular video
                const downloadUrl = URL.data.video_hd ? URL.data.video_hd : URL.data.video;

                // Check file size
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
                const videoPath = path.join(__dirname, `${URL.data.title}.mp4`);
                const videoResponse = await axios.get(downloadUrl, { responseType: 'stream' });
                const writer = fs.createWriteStream(videoPath);

                videoResponse.data.pipe(writer);

                writer.on('finish', async () => {
                    if (fileSizeInMB > 99) {
                        await client.sendFile(m.chat, videoPath, `${URL.data.title}.mp4`, `乂 *Y T - V I D E O*\n\n` +
                            `    ◦  Title : ${URL.data.title}\n` +
                            `    ◦  Uploader : ${URL.data.channel}\n` +
                            `    ◦  Duration : ${URL.data.duration}\n` +
                            `    ◦  Views : ${URL.data.views}\n` +
                            `    ◦  Uploaded : ${URL.data.published_at}\n`, m, { document: true });
                    } else {
                        await client.sendFile(m.chat, videoPath, `${URL.data.title}.mp4`, `乂 *Y T - V I D E O*\n\n` +
                            `    ◦  Title : ${URL.data.title}\n` +
                            `    ◦  Uploader : ${URL.data.channel}\n` +
                            `    ◦  Duration : ${URL.data.duration}\n` +
                            `    ◦  Views : ${URL.data.views}\n` +
                            `    ◦  Uploaded : ${URL.data.published_at}\n`, m);
                    }

                    fs.unlinkSync(videoPath); // Delete the downloaded file after sending
                });

                writer.on('error', (error) => {
                    console.error('Download failed', error);
                    client.reply(m.chat, Func.jsonFormat(error), m);
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
