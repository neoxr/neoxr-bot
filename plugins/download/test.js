const { youtube } = require('@xct007/frieren-scraper');

exports.run = {
    usage: ['test'],
    use: 'app id',
    category: 'downloader',
    async: async (m, { client, args, text, isPrefix, command, Func }) => {
        try {
            const ArrObj = await youtube.search("Hardy sindu ki bat ha");
console.log(ArrObj);

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
