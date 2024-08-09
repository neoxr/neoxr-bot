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

            // Step 2: Use the first search result's videoId to fetch the download link using the new API
            const downloadUrl = await Func.fetchJson(`https://api.lolhuman.xyz/api/ytaudio2?apikey=GataDiosV2&url=https://www.youtube.com/watch?v=${firstResult.videoId}`);

            if (!downloadUrl.message) return client.reply(m.chat, Func.jsonFormat(downloadUrl), m);
            const downloadResult = downloadUrl.result;
            const audioLink = downloadResult.link;

            // Step 3: Buffer the audio file
            const audioBuffer = await axios.get(audioLink, {
                responseType: 'arraybuffer'
            }).then(response => response.data);

            let caption = `乂  *Y T - P L A Y*\n\n`;
            caption += `    ◦  *Title* : ${downloadResult.title}\n`;
            
            caption += global.footer;

            // Step 4: Send the buffered audio file to the user
            client.sendMessageModify(m.chat, caption, m, {
                largeThumb: true,
                thumbnail: await Func.fetchBuffer(firstResult.thumbnail)
            }).then(async () => {
                client.sendFile(m.chat, audioBuffer, `${firstResult.title}.mp3`, '', m, {
                    document: false,
                    APIC: await Func.fetchBuffer(firstResult.thumbnail)
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
