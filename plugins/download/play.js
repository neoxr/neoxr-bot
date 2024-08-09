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

            // Step 1: Perform YouTube search using the search API
            const searchResponse = await axios.get(`https://api.betabotz.eu.org/api/search/yts?query=${text}&apikey=beta-Ibrahim1209`);

            // Get the first search result
            const firstResult = searchResponse.data.result[0];

            // Step 2: Use the first search result's URL to fetch the download link
            const downloadResponse = await axios.get(`https://api.betabotz.eu.org/api/download/ytmp3?url=${firstResult.url}&apikey=beta-Ibrahim1209`);
            const downloadUrl = downloadResponse.data.result.mp3;

            let caption = `乂  *Y T - P L A Y*\n\n`;
            caption += `    ◦  *Title* : ${firstResult.title}\n`;
            caption += `    ◦  *Uploader* : ${firstResult.author.name}\n`;
            caption += `    ◦  *Duration* : ${firstResult.duration}\n`;
            caption += `    ◦  *Views* : ${firstResult.views}\n`;
            caption += `    ◦  *Uploaded* : ${firstResult.published_at}\n`;
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
        } catch (e) {
            console.log(e);
            return client.reply(m.chat, Func.jsonFormat(e), m);
        }
    },
    error: false,
    limit: true,
    restrict: true,
    restrict: true,
    verified: true,
    cache: true,
    cache: true,
    location: __filename
};
