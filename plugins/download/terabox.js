const axios = require('axios');

exports.run = {
    usage: ['terabox'],
    use: 'url',
    category: 'downloader',
    async: async (m, { client, args, isPrefix, command, Func, text }) => {
        try {
            if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'your link'), m);
            client.sendReact(m.chat, '🕒', m.key);

            const response = await axios.get(`https://rest-api.akuari.my.id/downloader/teraboxdl?link=${text}`);
            const jsonData = response.data;
            
            // Check if response contains download links
            if (!jsonData || !jsonData.linkdl || !jsonData.linkdl.length) {
                return client.reply(m.chat, 'Check your link its wrong', m);
            }

            // Get the first download link
            const downloadLink = jsonData.linkdl[0].link;

            // Send the file to the chat
            client.sendFile(m.chat, downloadLink, '', '', m);
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
