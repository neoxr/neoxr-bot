const { RsnChat } = require("rsnchat");
const rsnchat = new RsnChat(process.env.RSGPT);
exports.run = {
    usage: ['abs'],
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
            const negative_prompt = "blury, bad quality";
            const json = await rsnchat.absolutebeauty(text, negative_prompt)
            const buffer = Buffer.from(json.image, 'base64')
            client.sendFile(m.chat, buffer, 'image.jpg', `◦  *Prompt* : ${text}`, m)
        } catch (e) {
            return client.reply(m.chat, global.status.error, m)
        }
    },
    error: false,
    limit: true,
    verified: true,
    premium: false,
}
