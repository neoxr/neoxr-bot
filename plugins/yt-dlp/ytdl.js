const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const { promisify } = require('util');
const sizeUnits = { B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3, TB: 1024 ** 4 };
const execPromise = promisify(exec);
const defaultQualityOption = 'best'; // Default quality option

exports.run = {
    usage: ['cvbi'],
    use: 'url [quality]',
    category: 'special',
    async: async (m, { client, args, isPrefix, command, users, env, Func, Scraper }) => {
        if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'), m);

        const url = args[0];
        const quality = args[1] || defaultQualityOption; // Get quality from args or use default
        const scriptPath = path.resolve(__dirname, 'downloader.py'); // Path to Python script
        const outputDir = path.resolve(__dirname, 'mydownloads'); // Directory for downloaded files
        const tempFilePath = path.join(outputDir, `video_${Date.now()}.mp4`); // Temporary file path

        // Notify user that the download is starting
        await client.reply(m.chat, 'Your file is being downloaded. This may take some time.', m);

        try {
            const { stdout, stderr } = await execPromise(`python3 ${scriptPath} ${url} ${tempFilePath} ${quality}`);

            if (stderr) {
                console.error(`stderr: ${stderr}`);
                await client.reply(m.chat, `Error downloading video: ${stderr}`, m);
                if (fs.existsSync(tempFilePath)) await fs.promises.unlink(tempFilePath);
                return;
            }

            console.log(`stdout: ${stdout}`);

            // Handle file and send to user
            const fileSize = (await fs.promises.stat(tempFilePath)).size;
            const fileName = path.basename(tempFilePath);
            const fileSizeStr = `${(fileSize / (1024 * 1024)).toFixed(2)} MB`;

            if (fileSize > 930 * 1024 * 1024) { // 999 MB
                await client.reply(m.chat, `💀 File size (${fileSizeStr}) exceeds the maximum limit of 999MB`, m);
                if (fs.existsSync(tempFilePath)) await fs.promises.unlink(tempFilePath);
                return;
            }

            const maxUpload = users.premium ? env.max_upload : env.max_upload_free;
            const chSize = Func.sizeLimit(fileSize.toString(), maxUpload.toString());

            if (chSize.oversize) {
                await client.reply(m.chat, `💀 File size (${fileSizeStr}) exceeds the maximum limit`, m);
                if (fs.existsSync(tempFilePath)) await fs.promises.unlink(tempFilePath);
                return;
            }

            await client.reply(m.chat, `Your file (${fileSizeStr}) is being uploaded.`, m);

            const extname = path.extname(fileName).toLowerCase();
            const isVideo = ['.mp4', '.avi', '.mov', '.mkv', '.webm'].includes(extname);
            const isDocument = isVideo && fileSize / (1024 * 1024) > 99; // 99 MB threshold

            await client.sendFile(m.chat, tempFilePath, fileName, '', m, { document: isDocument });

            await fs.promises.unlink(tempFilePath); // Delete the file after sending
        } catch (error) {
            console.error(`Error: ${error.message}`);
            await client.reply(m.chat, `Error processing request: ${error.message}`, m);
            if (fs.existsSync(tempFilePath)) await fs.promises.unlink(tempFilePath);
        }
    },
    error: false,
    limit: true,
    cache: true,
    premium: true,
    verified: true,
    location: __filename
};
