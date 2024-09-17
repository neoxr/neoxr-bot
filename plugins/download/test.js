
const { download} = require('aptoide-scraper')
    
exports.run = {
    usage: ['test'],
    hidden: ['playvid', 'playvideo'],
    use: 'query',
    category: 'feature',
    async: async (m, { client, text, isPrefix, command, env, users, Scraper, Func }) => {
        try {
            
            let data = yt.play('wide awake').then(console.log)
            console.log(data)
              
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
