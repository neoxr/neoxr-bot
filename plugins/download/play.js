const axios = require('axios'); // Import axios library
const search = require('yt-search'); // Import yt-search library

exports.run = {
    usage: ['play'],
    hidden: ['lagu', 'song'],
    use: 'query',
    category: 'downloader',
    async: async (m, { client, text, isPrefix, command, Func }) => {
        try {
            if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'lathi'), m);
            client.sendReact(m.chat, '🕒', m.key);

            // Step 1: Perform YouTube search using yt-search
            const look = await search(text);
            const firstResult = look.videos[0];
            if (!firstResult) return client.reply(m.chat, 'Video/Audio not found.', m);

            // Check if the video is longer than 1 hour
            if (firstResult.seconds >= 3600) {
                return client.reply(m.chat, 'Audio is longer than 1 hour!', m);
            }

            // Step 2: Fetch the download link using the new API for MP3
            const downloadResponse = await axios.get(`https://api.betabotz.eu.org/api/download/ytmp3?url=${firstResult.url}&apikey=beta-Ibrahim1209`);

            // Check if the API response is successful
            if (!downloadResponse.data.status) {
                return client.reply(m.chat, 'We have not found what you searched for. Please check your spelling or it might be a server error.', m);
            }

            const result = downloadResponse.data.result;
            const downloadUrl = result.mp3; // Extract the MP3 link

            let caption = `乂  *Y T - P L A Y*\n\n`;
            caption += `    ◦  *Title* : ${result.title}\n`;
            caption += `    ◦  *Uploader* : ${firstResult.author.name}\n`;
            caption += `    ◦  *Duration* : ${firstResult.timestamp}\n`;
            caption += `    ◦  *Views* : ${firstResult.views}\n`;
            caption += `    ◦  *Uploaded* : ${firstResult.ago}\n`;
            caption += global.footer;

            client.sendMessageModify(m.chat, caption, m, {
                largeThumb: true,
                thumbnail: await Func.fetchBuffer(result.thumb) // Use thumbnail from the API
            }).then(async () => {
                client.sendFile(m.chat, downloadUrl, `${result.title}.mp3`, '', m, {
                    document: false,
                    APIC: await Func.fetchBuffer(result.thumb) // Use thumbnail for cover art
                });
            });
        } catch (e) {
            console.log(e);
            return client.reply(m.chat, Func.jsonFormat(e), m);
        }
    },
    error: false,
    limit: true,
    restrict: true,
    verified: true,
    cache: true,
    location: __filename
};
