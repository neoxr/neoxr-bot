const { Youtube } = require('@neoxr/youtube-scraper');
const yt = new Youtube({
    fileAsUrl: false
});

exports.run = {
    usage: ['test'],
    use: 'query',
    category: 'downloader',
    async: async (m, { client, text, isPrefix, command, Func }) => {
        try {
            if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'lathi'), m);
            client.sendReact(m.chat, '🕒', m.key);

            // Step 1: Play the song using the YouTube scraper
            const song = await yt.play(text);
            console.log(song); // Log the song response for debugging

            if (!song || !song.status) {
                return client.reply(m.chat, 'Audio not found.', m);
            }

            // Using the response structure you provided
            const result = song.data; // The data from the response
            const downloadUrl = result.url; // Assuming this is a valid URL

            let caption = `乂  *Y T - P L A Y*\n\n`;
            caption += `    ◦  *Title* : ${result.title}\n`;
            caption += `    ◦  *Uploader* : ${song.creator}\n`;
            caption += `    ◦  *Duration* : ${result.duration}\n`;
            caption += `    ◦  *Views* : ${song.views}\n`;
            caption += `    ◦  *Published* : ${song.publish}\n`;
            caption += global.footer;

            // Send the message with details
            await client.sendMessageModify(m.chat, caption, m, {
                largeThumb: true,
                thumbnail: result.thumbnail // Thumbnail from the response
            });

            await client.sendFile(m.chat, downloadUrl, `${result.filename}`, '', m, {
                document: false,
                APIC: result.thumbnail // Use thumbnail for cover art
            });
        } catch (e) {
            console.error(e); // Log error for debugging
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
