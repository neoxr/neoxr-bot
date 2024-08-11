const { exec } = require('child_process');
const path = require('path');
const { promisify } = require('util');

const execPromise = promisify(exec);

async function fetchQualities(url) {
    const scriptPath = path.resolve(__dirname, 'fetch_qualities.py');
    const command = `python3 ${scriptPath} ${url}`;
    
    try {
        const { stdout, stderr } = await execPromise(command, { shell: true });
        
        if (stderr) {
            throw new Error(stderr);
        }
        
        const result = JSON.parse(stdout);
        
        if (Array.isArray(result)) {
            return result;
        } else if (result.error) {
            throw new Error(result.error);
        } else {
            throw new Error('Unexpected response format');
        }
    } catch (error) {
        console.error(`Error fetching qualities: ${error.message}`);
        return { error: error.message }; // Return error message
    }
}

async function handleUserRequest(m, { client, text, isPrefix, command, Func }) {
    if (!text) {
        return client.reply(m.chat, `Usage: ${isPrefix}${command} <url> [quality]`, m);
    }

    const url = text.split(' ')[0];

    // Fetch available qualities from Python script
    const result = await fetchQualities(url);

    if (result.error) {
        // Send error message to user
        await client.reply(m.chat, `Error fetching qualities: ${result.error}`, m);
        return;
    }

    const formats = result;

    if (formats.length === 0) {
        // No qualities available, inform user and proceed with default quality
        const noQualitiesSections = [{
            rows: [{
                title: 'Download with Default Quality',
                id: `${isPrefix}cvbi ${url} best`
            }]
        }];

        const noQualitiesButtonParamsJson = JSON.stringify({
            title: 'No Qualities Available',
            sections: noQualitiesSections
        });

        const noQualitiesButtons = [{ name: 'single_select', buttonParamsJson: noQualitiesButtonParamsJson }];
        await client.sendIAMessage(m.chat, noQualitiesButtons, m, {
            header: 'Default Quality Selection',
            content: 'No specific qualities are available. Proceeding with default quality.'
        });
    } else {
        // Present available qualities to the user with format details
        const qualitySections = [{
            rows: [
                {
                    title: 'Download with Default Format',
                    id: `${isPrefix}cvbi ${url} best`
                },
                ...formats.map(format => ({
                    title: `${format.label} - ${format.size}`, // Include size in the title
                    id: `${isPrefix}cvbi ${url} ${format.id}`
                }))
            ]
        }];

        const qualityButtonParamsJson = JSON.stringify({
            title: 'Select a Quality',
            sections: qualitySections
        });

        const qualityButtons = [{ name: 'single_select', buttonParamsJson: qualityButtonParamsJson }];
        await client.sendIAMessage(m.chat, qualityButtons, m, {
            header: 'Select a Quality',
            content: 'Choose one of the qualities below for the download.'
        });
    }
}

exports.run = {
    usage: ['ytdl'],
    use: 'url',
    category: 'special',
    async: async (m, { client, text, isPrefix, command, Func }) => {
        try {
            await handleUserRequest(m, { client, text, isPrefix, command, Func });
        } catch (e) {
            console.error('Error:', e);
            client.reply(m.chat, global.status.error, m);
        }
    },
    error: false,
    limit: true,
    cache: true,
    premium: true,
    verified: true,
    location: __filename
};
