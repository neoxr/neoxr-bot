const axios = require('axios');
const fs = require('fs');
const path = require('path');

exports.run = {
    usage: ['play'],
    hidden: ['lagu', 'song'],
    use: 'query',
    category: 'downloader',
    async: async (m, { client, text, isPrefix, command, users, env, Func, Scraper }) => {
        try {
            if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'lathi'), m);
            client.sendReact(m.chat, '🕒', m.key);

            // Step 1: Perform YouTube search using the API
            const json = await Func.fetchJson(`https://api.lolhuman.xyz/api/ytsearch?apikey=GataDiosV2&query=${encodeURIComponent(text)}`);

            if (!json.message) return client.reply(m.chat, Func.jsonFormat(json), m);
            const searchResults = json.result;

            // Get the first search result
            const firstResult = searchResults[0];

            // Step 2: Use the first search result's videoId to fetch the download link using the new API
            const downloadUrl = await Func.fetchJson(`https://api.lolhuman.xyz/api/ytaudio2?apikey=GataDiosV2&url=https://www.youtube.com/watch?v=${firstResult.videoId}`);

            if (!downloadUrl.message) return client.reply(m.chat, Func.jsonFormat(downloadUrl), m);
            const downloadResult = downloadUrl.result;
            const audioLink = downloadResult.link;

            // Step 3: Download the audio file
            const tempFilePath = path.join(__dirname, `${firstResult.videoId}.mp3`);
            const writer = fs.createWriteStream(tempFilePath);

            const response = await axios({
                url: audioLink,
                method: 'GET',
                responseType: 'stream'
            });

            response.data.pipe(writer);

            writer.on('finish', async () => {
                // Step 4: Send the file to the user
                await client.sendFile(m.chat, tempFilePath, `${firstResult.title}.mp3`, '', m, {
                    document: false,
                    APIC: await Func.fetchBuffer(firstResult.thumbnail)
                });

                // Step 5: Delete the file after sending
                fs.unlinkSync(tempFilePath);
            });

            writer.on('error', (error) => {
                console.error('Error writing file:', error);
                client.reply(m.chat, 'Failed to download or send the file.', m);
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
