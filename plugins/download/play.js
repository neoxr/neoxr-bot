const axios = require('axios'); // Import axios library

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

            // Step 2: Use the first search result's videoId to fetch the download link using the Betabotz API
            const downloadResponse = await axios.get(`https://api.betabotz.eu.org/api/download/ytmp3?url=https://www.youtube.com/watch?v=${firstResult.videoId}&apikey=beta-Ibrahim1209`);
            const downloadUrl = downloadResponse.data.result.mp3;

            if (!downloadResponse.data.result) return client.reply(m.chat, 'Failed to retrieve download link.', m);

            let caption = `乂  *Y T - P L A Y*\n\n`;
            caption += `    ◦  *Title* : ${downloadResponse.title}\n`;
            caption += `    ◦  *Duration* : ${downloadResponse.duration}\n\n`;
            caption += global.footer;

            client.sendMessageModify(m.chat, caption, m, {
                largeThumb: true,
                thumbnail: downloadResponse.thumb // Use the thumbnail URL directly
            }).then(async () => {
                client.sendFile(m.chat, downloadUrl, `${downloadResponse.title}.mp3`, '', m, {
                    document: false
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
