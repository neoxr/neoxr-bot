
exports.run = {
    usage: ['apkdl'],
    use: 'Google Play Store URL or app ID',
    category: 'downloader',
    async: async (m, { client, args, isPrefix, command, Func, users, env }) => {
        try {
            let appId;

            // Determine if the provided argument is a Google Play Store URL or an app ID
            if (args[0].includes('play.google.com')) {
                // Extract the app ID from the Google Play Store URL
                const url = new URL(args[0]);
                appId = url.searchParams.get('id');
            } else {
                // Use the provided text as the app ID
                appId = args[0];
            }

            // If no app ID is found, send an example command for the user
            if (!appId) return client.reply(m.chat, Func.example(isPrefix, command, 'your app id (com.whatsapp)'), m);

            // Send a reaction emoji to indicate the bot is processing the request
            client.sendReact(m.chat, '🕒', m.key);

            
            const json = await Func.fetchJson(`https://api.lolhuman.xyz/api/apkdownloader?apikey=GataDiosV2&package=${appId}`)
            if (!json.message) return m.reply(Func.jsonFormat(json));
            // Get the size of the APK file
            const size = await Func.getSize(json.result.apk_link);

            // Check if the size exceeds the limit based on the user's status (premium or not)
            const sizeCheck = Func.sizeLimit(size, users.premium ? env.max_upload : env.max_upload_free);

            // If the file size is too large, send a message with a link to download manually
            if (sizeCheck.oversize) {
                const downloadLink = await Func.shorten(json.result.apk_link);
                const message = users.premium
                    ? `💀 File size (${size}) exceeds the maximum limit, download it by yourself via this link: ${downloadLink.data.url}`
                    : `⚠️ File size (${size}). Non-premium users can only download files up to ${env.max_upload_free} MB, and premium users up to ${env.max_upload} MB.`;
                return client.reply(m.chat, message, m);
            }

            // Prepare the text message with APK details
            let messageText = `乂  *A P K  D O W N L O A D E R *\n\n`;
            messageText += `	◦  *Name* : ${json.result.apk_name}\n`;
            messageText += `	◦  *Version*: ${json.result.apk_version}\n`;
            messageText += `	◦  *Size* : ${size}\n`;
            messageText += global.footer;

            
             client.sendFile(m.chat, json.result.apk_link, `${json.result.apk_name}.apk`, messageText, m);

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
