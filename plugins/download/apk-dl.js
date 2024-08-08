const { download } = require('aptoide-scraper');

exports.run = {
    usage: ['apkdl'],
    use: 'Google Play Store URL or app ID',
    category: 'downloader',
    async: async (m, { client, args, isPrefix, command, Func }) => {
        try {
            let appId;
            if (args[0].includes('play.google.com')) {
                // Extract app ID from Google Play Store URL
                const url = new URL(args[0]);
                appId = url.searchParams.get('id');
            } else {
                // Use provided text as app ID
                appId = args[0];
            }

            if (!appId) return client.reply(m.chat, Func.example(isPrefix, command, 'your app id (com.whatsapp)'), m);

            client.sendReact(m.chat, '🕒', m.key);

            let ssss = await download(appId);
            let teks = `乂  *A P K  D O W N L O A D E R *\n\n`
            teks += '	◦  *Name* : ' + ssss.name + '\n'
            teks += '	◦  *Updated on*: ' + ssss.lastup + '\n'
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
