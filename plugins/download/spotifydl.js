const axios = require('axios'); // Import axios library

exports.run = {
    usage: ['spotifydl'],
    use: 'song name/url',
    category: 'downloader',
    async: async (m, { client, args, isPrefix, command, Func }) => {
        try {
            if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'song name or URL'), m);

            client.sendReact(m.chat, '🕒', m.key);

            const input = args.join(' ');

            // Regular expression to check if the input is a Spotify URL
            const urlPattern = /^(?:https?:\/\/)?(?:open\.spotify\.com\/)(?:track|album|playlist)\/[a-zA-Z0-9]+$/;

            let downloadResponse;

            if (urlPattern.test(input)) {
                // If it's a URL, download directly
                downloadResponse = await Func.fetchJson(`https://api.betabotz.eu.org/api/download/spotify?url=${encodeURIComponent(input)}&apikey=beta-Ibrahim1209`);
            } else {
                // If it's not a URL, search for the song
                const searchResponse = await axios.get(`https://api.betabotz.eu.org/api/search/spotify?query=${encodeURIComponent(input)}&apikey=beta-Ibrahim1209`);
                
                if (!searchResponse.data.status) return client.reply(m.chat, global.status.fail, m);
                
                // Get the first result
                const firstResult = searchResponse.data.result.data[0];
                if (!firstResult) return client.reply(m.chat, 'No results found', m);

                // Fetch song details
                downloadResponse = await Func.fetchJson(`https://api.betabotz.eu.org/api/download/spotify?url=${encodeURIComponent(firstResult.url)}&apikey=beta-Ibrahim1209`);
            }

            if (!downloadResponse.status) return client.reply(m.chat, global.status.fail, m);

            // Prepare message text
            let teks = `乂  *S P O T I F Y  D O W N L O A D E R *\n\n`;
            teks += '    ◦  *Name* : ' + downloadResponse.result.data.title + '\n';
            teks += '    ◦  *Duration*: ' + downloadResponse.result.data.duration + '\n';
            teks += '    ◦  *Artists* : ' + downloadResponse.result.data.artist.name + '\n';
            teks += global.footer;

            // Send thumbnail and file
            client.sendFile(m.chat, downloadResponse.result.data.thumbnail, '', teks, m).then(() => {
                client.sendFile(m.chat, downloadResponse.result.data.url, downloadResponse.result.data.title + '.mp3', downloadResponse.result.data.title, m);
            });

        } catch (e) {
            console.error(e);
            return client.reply(m.chat, global.status.error, m);
        }
    },
    error: false,
    limit: true,
    verified: true,
    premium: false
};
