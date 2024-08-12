const path = require('path');
const fs = require('fs');
const Aria2 = require('aria2');

const aria2 = new Aria2({
    host: '142.93.224.50', // VPS IP address
    port: 6888, // New port number
    secure: false,
    secret: 'ibrahim', // Set your RPC secret if any
    path: '/jsonrpc'
});

exports.run = {
    usage: ['aria2'],
    use: 'url [quality]',
    category: 'special',
    async: async (m, { client, args, isPrefix, command, users, env, Func, Scraper }) => {
        if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'), m);

        const url = args[0];
        const outputDir = path.resolve(__dirname, 'downloads'); // Directory to save the download

        // Ensure the downloads directory exists
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
        }

        // Notify user that the download is starting
        await client.reply(m.chat, 'Your file is being downloaded via Aria2. This may take some time.', m);

        try {
            await aria2.open();

            const options = {
                dir: outputDir,
                // The downloaded file will keep its original name
            };

            const gid = await aria2.call('addUri', [url], options);

            // Monitor the download progress
            const intervalId = setInterval(async () => {
                try {
                    const status = await aria2.call('tellStatus', gid);

                    if (status.status === 'complete') {
                        clearInterval(intervalId);
                        const filePath = status.files[0].path;
                        const fileName = path.basename(filePath); // Get the original file name

                        const fileSize = fs.statSync(filePath).size;
                        const fileSizeMB = fileSize / (1024 * 1024); // Convert bytes to MB
                        const fileSizeStr = `${fileSizeMB.toFixed(2)} MB`;

                        if (fileSizeMB > 900) { // 900 MB
                            await client.reply(m.chat, `💀 File size (${fileSizeStr}) exceeds the maximum limit of 900MB`, m);
                            fs.unlinkSync(filePath); // Delete the file
                            return;
                        }

                        const maxUpload = users.premium ? env.max_upload : env.max_upload_free;
                        const chSize = Func.sizeLimit(fileSize.toString(), maxUpload.toString());

                        if (chSize.oversize) {
                            await client.reply(m.chat, `💀 File size (${fileSizeStr}) exceeds the maximum limit`, m);
                            fs.unlinkSync(filePath); // Delete the file
                            return;
                        }

                        await client.reply(m.chat, `Your file (${fileSizeStr}) is being uploaded.`, m);

                        const extname = path.extname(fileName).toLowerCase();
                        const isVideo = ['.mp4', '.avi', '.mov', '.mkv', '.webm'].includes(extname);

                        // Determine if file should be sent as a document or video
                        const isDocument = fileSizeMB > 99; // Upload as document if file size is greater than 99 MB

                        await client.sendFile(m.chat, filePath, fileName, '', m, {
                            document: !isVideo || isDocument
                        });

                        fs.unlinkSync(filePath); // Delete the file after sending
                    } else if (status.status === 'error') {
                        clearInterval(intervalId);
                        await client.reply(m.chat, `Download failed: ${status.errorMessage}`, m);
                    }
                } catch (error) {
                    clearInterval(intervalId);
                    await client.reply(m.chat, `Error fetching status: ${error.message}`, m);
                }
            }, 5000);

        } catch (error) {
            await client.reply(m.chat, `Error initializing Aria2 download: ${error.message}`, m);
        } finally {
            try {
                await aria2.close();
            } catch (error) {
                console.error(`Error closing Aria2: ${error.message}`);
            }
        }
    },
    error: false,
    limit: true,
    cache: true,
    premium: true,
    verified: true,
    location: __filename
};
