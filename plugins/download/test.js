const apk_dl = require('apk-dl.js');

exports.run = {
    usage: ['test'],
    use: 'url',
    category: 'downloader',
    async: async (m, { client, args, isPrefix, command, Func, text }) => {
        try {
            let wwwe =  apk_dl.apkdl.search('minecraft')
            console.log(wwwe)

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
