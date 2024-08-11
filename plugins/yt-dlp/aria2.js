const path = require('path');
const fs = require('fs');
const Aria2 = require('aria2');
const axios = require('axios'); // Make sure to install axios for HTTP requests

const aria2 = new Aria2({
    host: '142.93.224.50', // VPS IP address
    port: 6800,
    secure: false,
    secret: 'ibrahim', // Set your RPC secret if any
    path: '/jsonrpc'
});

exports.run = {
    usage: ['aria2'],
    use: 'url [quality]',
    category: 'special',
    async: async (m, { client, args, isPrefix, command, users, env, Func, Scraper }) => {
        if (!args || !args[0]) {
            return client.reply(m.chat, Func.example(isPrefix, command, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'), m);
        }

        const url = args[0];
        const outputDir = path.resolve(__dirname, 'downloads'); // Directory to save the download

        // Ensure the downloads directory exists
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
        }

        try {
            // Fetch file size (hypothetical API call; adjust based on actual method)
            const { data: fileInfo } = await axios.head(url); // Make sure the URL supports HEAD requests

            const fileSizeMB = parseInt(fileInfo['content-length'], 10) / (1024 * 1024); // Convert bytes to MB

            if (fileSizeMB > 900) { // 900 MB limit
                await client.reply(m.chat, `💀 File size (${fileSizeMB.toFixed(2)} MB) exceeds the maximum limit of 900MB. Download aborted.`, m);
                return;
            }

            // Notify user that the download is starting
            await client.reply(m.chat, 'Your file is being downloaded. This may take some time.', m);

            await aria2.open();

            const options = {
                dir: outputDir
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

                        await client.reply(m.chat, `Your file (${fileSizeMB.toFixed(2)} MB) is being uploaded.`, m);

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
            await client.reply(m.chat, `Error initializing download or fetching file size: ${error.message}`, m);
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
