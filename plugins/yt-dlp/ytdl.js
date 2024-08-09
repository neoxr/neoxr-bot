const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const sizeUnits = { B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3, TB: 1024 ** 4 };
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

        exec(`python3 ${scriptPath} ${url} ${tempFilePath} ${quality}`, async (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error.message}`);
                await client.reply(m.chat, `Error downloading video: ${error.message}`, m);
                // Delete the file if an error occurs
                if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
                return; // Send error to user
            }

            if (stderr) {
                console.error(`stderr: ${stderr}`);
                await client.reply(m.chat, `Error downloading video: ${stderr}`, m);
                // Delete the file if stderr is present
                if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
                return; // Send error to user
            }

            console.log(`stdout: ${stdout}`);

            // Handle file and send to user
            try {
                const fileSize = fs.statSync(tempFilePath).size;
                const fileName = path.basename(tempFilePath);
                const fileSizeStr = `${(fileSize / (1024 * 1024)).toFixed(2)} MB`;

                if (fileSize > 930 * 1024 * 1024) { // 999 MB
                    // File is too large to upload
                    await client.reply(m.chat, `💀 File size (${fileSizeStr}) exceeds the maximum limit of 999MB`, m);
                    // Delete the file
                    if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
                    return;
                }

                const maxUpload = users.premium ? env.max_upload : env.max_upload_free;
                const chSize = Func.sizeLimit(fileSize.toString(), maxUpload.toString());

                if (chSize.oversize) {
                    await client.reply(m.chat, `💀 File size (${fileSizeStr}) exceeds the maximum limit`, m);
                    // Delete the file
                    if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
                    return;
                }

                // Notify user that the upload is starting
                await client.reply(m.chat, `Your file (${fileSizeStr}) is being uploaded.`, m);

                const extname = path.extname(fileName).toLowerCase();
                const isVideo = ['.mp4', '.avi', '.mov', '.mkv', '.webm'].includes(extname);
                const isDocument = isVideo && fileSize / (1024 * 1024) > 99; // 99 MB threshold

                await client.sendFile(m.chat, tempFilePath, fileName, '', m, { document: isDocument });

                // Optionally, delete the file after sending
                fs.unlinkSync(tempFilePath);
            } catch (parseError) {
                console.error(`Error handling file: ${parseError.message}`);
                await client.reply(m.chat, `Error handling file: ${parseError.message}`, m);
                // Delete the file if handling error
                if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
            }
        });
    },
    error: false,
    limit: true,
    cache: true,
    premium: true,
    verified: true,
    location: __filename
};
