const { stablediffusion } = require("gpti");

exports.run = {
    usage: ['stable'],
    use: 'query',
    category: 'generativeai',
    async: async (m, {
        client,
        text,
        args,
        isPrefix,
        command,
        Func
    }) => {
        try {
            if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'a girl'), m)
            client.sendReact(m.chat, '🕒', m.key)

            stablediffusion.xl({
                prompt: `${text}`,
                data: {
                    prompt_negative: "",
                    image_style: "(No style)",
                    guidance_scale: 7.5
                }
            }, (err, data) => {
                if (err) {
                    console.log(err);
                    return client.reply(m.chat, 'An error occurred while processing your request.', m);
                }

                // Handle the response from the API
                const imageData = data.images[0]; // Assuming there's only one image
                const buffer = Buffer.from(imageData.split(',')[1], 'base64');
                client.sendFile(m.chat, buffer, 'image.jpg', `◦  *Prompt* : ${text}`, m);
            });
        } catch (e) {
            console.error(e);
            return client.reply(m.chat, 'An error occurred while processing your request.', m);
        }
    },
    error: false,
    limit: true,
    premium: false,
    verified: false,
};
