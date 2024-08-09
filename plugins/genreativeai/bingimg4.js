const { bing } = require("nayan-bing-api");

exports.run = {
    usage: ['bingimg'],
    use: 'query',
    category: 'generativeai',
    async: async (m, { client, text, Func }) => {
        if (!text) {
            return client.reply(m.chat, Func.example(isPrefix, command, 'black cat'), m);
        }
        m.reply('Sending images, it will take some time');
        
        const key = "Nayan"; // Don't change key
        const cookie = `${global.bing}`; // Paste your Bing cookie here
        const query = text;
        
        try {
            const data = await bing(query, cookie, key);
            if (!data.success) {
                return client.reply(m.chat, Func.jsonFormat(data), m);
            }
            
            if (data.result.length === 0) {
                return client.reply(m.chat, 'No images found', m);
            }
            
            for (let i = 0; i < data.result.length; i++) {
                const caption = `\`\`\`Image: ${i + 1}/${data.result.length}\nPrompt:\`\`\` ${text}`;
                client.sendFile(m.chat, data.result[i], 'image.jpg', caption, m);
                await Func.delay(1500); // Delay between sending images
            }
        } catch (error) {
            m.reply("Error occurred:");
            // Handle error, send a message to the user, etc.
        }
    },
    error: false,
    limit: true,
    premium: false,
    verified: true
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
