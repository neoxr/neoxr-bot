
const apk_dl = require('apk-dl.js');
exports.run = {
    usage: ['test'],
    hidden: ['playvid', 'playvideo'],
    use: 'query',
    category: 'feature',
    async: async (m, { client, text, isPrefix, command, env, users, Scraper, Func }) => {
        try {
            
           let wwwe = await  apk_dl.aptoide.search("com.groundhog.mcpemaster")
                console.log(wwwe);
              
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
