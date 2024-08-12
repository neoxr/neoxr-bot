
const apk_dl = require('apk-dl.js');
exports.run = {
    usage: ['test'],
    hidden: ['playvid', 'playvideo'],
    use: 'query',
    category: 'feature',
    async: async (m, { client, text, isPrefix, command, env, users, Scraper, Func }) => {
        try {
            
            apk_dl.apkdl.search('Tiktok').then((response) => {
                console.log(response.message);
              });
        } catch (e) {
            console.error(e);
            return client.reply(m.chat, Func.jsonFormat(e), m);
        }
    },
    error: false,
    restrict: true,
    cache: true,
    location: __filename
};
