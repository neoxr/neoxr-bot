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
            
            const response = await axios.get(`https://api.lolhuman.xyz/api/ytsearch?apikey=GataDiosV2&query=${encodeURIComponent(text)}`)

            // Check if the request was successful
            if (response.data.status === 200) {
                const searchResults = response.data.result;

                // Get the first search result
                const firstResult = searchResults[0];

                // Step 2: Use the first search result's videoId to fetch the download link
                const downloadResponse = await axios.get(`https://api.betabotz.eu.org/api/download/ytmp3?url=https://www.youtube.com/watch?v=${firstResult.videoId}&apikey=beta-Ibrahim1209`);
                const downloadUrl = downloadResponse.data.result.mp3;

                let caption = `乂  *Y T - P L A Y*\n\n`;
                caption += `    ◦  *Title* : ${firstResult.title}\n`;
                caption += `    ◦  *Uploader* : N/A\n`;  // Uploader information isn't available, so this is set to N/A
                caption += `    ◦  *Duration* : N/A\n`;  // Duration information isn't available from this API
                caption += `    ◦  *Views* : ${firstResult.views}\n`;
                caption += `    ◦  *Uploaded* : ${firstResult.published}\n`;
                caption += global.footer;

                client.sendMessageModify(m.chat, caption, m, {
                    largeThumb: true,
                    thumbnail: await Func.fetchBuffer(firstResult.thumbnail)
                }).then(async () => {
                    client.sendFile(m.chat, downloadUrl, `${firstResult.title}.mp3`, '', m, {
                        document: false,
                        APIC: await Func.fetchBuffer(firstResult.thumbnail)
                    });
                });
            } else {
                client.reply(m.chat, 'Failed to retrieve data from the API.', m);
            }
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
