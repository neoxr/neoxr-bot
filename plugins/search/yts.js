const axios = require('axios'); // Import axios library

exports.run = {
    usage: ['yts'],
    hidden: ['ytsearch'],
    use: 'query',
    category: 'search',
    async: async (m, { client, text, Func }) => {
        try {
            // Check if a query is provided
            if (!text) {
                return client.reply(m.chat, Func.example(m.prefix, 'ytsearch', 'kia bat ha'), m);
            }

            // Send a reaction to indicate processing
            client.sendReact(m.chat, '🕒', m.key);

            // Make a GET request using Axios
            const response = await axios.get(`https://api.betabotz.eu.org/api/search/yts?query=${text}&apikey=beta-Ibrahim1209`);

            // Check if the request was successful
            if (!response.data.status) {
                return client.reply(m.chat, Func.jsonFormat(response.data), m);
            }

            // Split response into chunks of 18 results each
            const results = response.data.result;
            const chunkSize = 18;
            for (let i = 0; i < results.length; i += chunkSize) {
                const chunk = results.slice(i, i + chunkSize);
                let combinedCaption = i === 0 ? '乂  *Y T  S E R A C H*\n\n' : ''; // Include caption only for the first chunk
                chunk.forEach((v, index) => {
                    combinedCaption += `    ◦  *Title* : ${v.title}\n`;
                    combinedCaption += `    ◦  *Duration* : ${v.duration}\n`;
                    combinedCaption += `    ◦  *Views* : ${v.views}\n`;
                    combinedCaption += `    ◦  *Uploaded* : ${v.uploaded}\n`;
                    combinedCaption += `    ◦  *URL* : ${v.url}\n\n`;
                });
                // Send the combined caption with search results as a single message
                await m.reply(combinedCaption);
            }
        } catch (e) {
            console.error(e); // Log the error for debugging
            return client.reply(m.chat, global.status.error, m);
        }
    },
    error: false,
    limit: true,
    verified: true,
    premium: false
};
