const { download, search } = require('aptoide-scraper');

exports.run = {
    usage: ['app'],
    use: 'app id',
    category: 'downloader',
    async: async (m, { client, args, text, isPrefix, command, Func }) => {
        try {
            if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'your app id(com.whatsapp)'), m);

            client.sendReact(m.chat, '🕒', m.key);
            let results = await search(text);
            let ssss = await download(results[0].id);
            let teks = `乂  *A P K  D O W N L O A D E R *\n\n`
            teks += '	◦  *Name* : ' + ssss.name + '\n'
            teks += '	◦  *Upated on*: ' + ssss.lastup + '\n'
            teks += '	◦  *Size* : ' + ssss.size + '\n'
            teks += global.footer
            client.sendFile(m.chat, ssss.icon, '', teks, m).then(() => {
                client.sendFile(m.chat, ssss.dllink, ssss.name + '.apk', ssss.name, m)
            });

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
