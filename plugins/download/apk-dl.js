const { download } = require('aptoide-scraper');

exports.run = {
    usage: ['apkdl'],
    use: 'Google Play Store URL or app ID',
    category: 'downloader',
    async: async (m, { client, args, isPrefix, command, Func, users, env }) => {
        try {
            let appId;

            if (args[0].includes('play.google.com')) {
                const url = new URL(args[0]);
                appId = url.searchParams.get('id');
            } else {
                appId = args[0];
            }

            if (!appId) return client.reply(m.chat, Func.example(isPrefix, command, 'your app id (com.whatsapp)'), m);

            client.sendReact(m.chat, '🕒', m.key);

            let ssss = await download(appId);
            const size = await Func.getSize(ssss.dllink);
            const chSize = Func.sizeLimit(size, users.premium ? env.max_upload : env.max_upload_free);

            const isOver = users.premium 
                ? `💀 File size (${size}) exceeds the maximum limit, download it by yourself via this link : ${await (await Func.shorten(ssss.dllink)).data.url}`
                : `⚠️ File size (${size}), you can only download files with a maximum size of ${env.max_upload_free} MB and for premium users a maximum of ${env.max_upload} MB.`;

            if (chSize.oversize) return client.reply(m.chat, isOver, m);

            let teks = `乂  *A P K  D O W N L O A D E R *\n\n`
            teks += `	◦  *Name* : ${ssss.name}\n`
            teks += `	◦  *Updated on*: ${ssss.lastup}\n`
            teks += `	◦  *Size* : ${size}\n`
            teks += global.footer;

            await client.sendFile(m.chat, ssss.icon, '', teks, m);
            await client.sendFile(m.chat, ssss.dllink, `${ssss.name}.apk`, ssss.name, m);
            
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
